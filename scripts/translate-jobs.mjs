// Build a Vietnamese and an English copy of the jobs data (public/data/data.vi.json, data.en.json)
// from public/data/data.json. A job keeps its posted text in the language it was written in (by majority)
// and is machine-translated into the other one through an OpenAI-compatible LLM API (Woku Shop by default).
// Translations are reused while a job's text is unchanged, so only new or edited posts cost a call.
// A failed translation leaves that copy in the posted language, and the next run tries again.
// Run with: node scripts/translate-jobs.mjs   (needs LLM_API_KEY in the environment or in .env.local)
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { techIn } from './job-rules.mjs';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const SRC = path('../public/data/data.json');
const OUT = { vi: path('../public/data/data.vi.json'), en: path('../public/data/data.en.json') };

try {
  process.loadEnvFile(path('../.env.local'));
} catch {
  // No local env file: CI passes the key as an environment variable.
}
const API_KEY = process.env.LLM_API_KEY;
const API_BASE = (process.env.LLM_BASE_URL || 'https://llm.wokushop.com/v1').replace(/\/+$/, '');
// Tried in order; a model the gateway reports as unavailable is skipped for the rest of the run.
const MODELS = (process.env.LLM_MODEL || 'gemini-3.8-flash,gemini-3.7-flash').split(',').map((m) => m.trim()).filter(Boolean);
const MAX_JOBS = Number(process.env.TRANSLATE_LIMIT) || 80; // jobs translated per run, a guard against runaway spend
const CONCURRENCY = 3;
const ATTEMPTS = 2;
const TIMEOUT_MS = 120000;
const PROMPT_VERSION = 1; // bump to retranslate every job after changing the prompt

const LANG_NAME = { vi: 'Vietnamese', en: 'English' };

// Fixed labels from the classifier, which writes them in Vietnamese.
const EN_LABELS = {
  'Thỏa thuận': 'Negotiable',
  'Toàn thời gian': 'Full-time',
  'Thực tập / Cộng tác viên': 'Internship / Freelance',
  'Hà Nội': 'Hanoi',
  'TP. HCM': 'Ho Chi Minh City'
};
const EN_OFFICES = {
  'Tầng 22, Vinacomin Tower, 3 Dương Đình Nghệ, Cầu Giấy, Hà Nội': 'Floor 22, Vinacomin Tower, 3 Duong Dinh Nghe, Cau Giay, Hanoi'
};

const SYSTEM_PROMPT = `You translate job posts for an IT recruitment site (FPT Smart Cloud, Vietnam) between Vietnamese and English.
Write the way a native-speaking IT recruiter would write the post from scratch: natural, fluent and concise, never word-for-word.

Rules:
- Keep the meaning, every fact and every number. Add nothing, drop nothing, never merge or split items.
- Keep exactly as written: technology, product, framework, tool, company, team and certificate names, acronyms and versions (Python, Kubernetes, CI/CD, AWS, OpenStack, LLM, SRE, ISO 27001, FPT Smart Cloud...).
- Text that is already in the target language stays as it is.

Into Vietnamese:
- Use the wording Vietnamese IT people really use at work. Keep the English IT terms that Vietnamese tech job posts normally leave untranslated, such as backend, frontend, fullstack, deploy, pipeline, framework, microservices, production, staging, on-call, incident, monitoring, logging, code review, unit test, performance, scale, data pipeline, model, fine-tune, prompt, agent, stakeholder, requirement, roadmap, sprint, Agile/Scrum, solution, platform.
- Never translate "production" as "sản xuất" or "pipeline" as "đường ống".
- Headings: "Must-Have Qualifications" → "Yêu cầu bắt buộc", "Preferred Qualifications"/"Nice to have" → "Điểm cộng", "What We Look For" → "Tố chất chúng tôi tìm kiếm".
- Speak to the candidate as "bạn". Items are short and direct, start with a verb or a noun, and use sentence case.

Into English:
- Use standard, idiomatic job-post English: "3+ years of experience in...", "Hands-on experience with...", "Strong understanding of...".
- Headings: "Yêu cầu" → "Requirements", "Yêu cầu bắt buộc" → "Must-have", "Ưu tiên"/"Điểm cộng" → "Nice to have", "Mô tả công việc" → "Responsibilities".
- Vietnamese place names keep their usual English spelling (Hà Nội → Hanoi, TP. HCM → Ho Chi Minh City).

Reply with only a JSON object with exactly the structure of the input: the same keys, and in every array the same number of items in the same order.`;

const VI_CHARS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

// Vietnamese posts have about every second word accented, even with English tech terms mixed in;
// English posts only a stray place name.
function languageOf(texts) {
  const words = texts.join(' ').split(/\s+/).filter(Boolean);
  const accented = words.filter((w) => VI_CHARS.test(w)).length;
  return words.length && accented / words.length >= 0.2 ? 'vi' : 'en';
}

// The prose of a job, which is what gets translated; titles, skills, levels and the like stay as posted.
function contentOf(job) {
  return {
    desc: job.desc || '',
    duties: job.detail?.duties || [],
    requirements: (job.detail?.requirements || []).map(({ title, items }) => ({ title, items }))
  };
}

function withContent(job, content) {
  const detail = { ...job.detail, duties: content.duties };
  if (job.detail?.requirements) detail.requirements = content.requirements;
  return { ...job, desc: content.desc, detail };
}

const textsOf = (c) => [c.desc, ...c.duties, ...c.requirements.flatMap((r) => [r.title, ...r.items])];
const hashOf = (c) => createHash('sha256').update(PROMPT_VERSION + JSON.stringify(c)).digest('hex').slice(0, 16);

function toEnglishLabels(job) {
  const out = {
    ...job,
    salary: EN_LABELS[job.salary] ?? job.salary,
    location: job.location.split(' / ').map((p) => EN_LABELS[p] ?? p).join(' / ')
  };
  if (job.detail) {
    out.detail = { ...job.detail, type: EN_LABELS[job.detail.type] ?? job.detail.type };
    if (job.detail.experience) out.detail.experience = job.detail.experience.replace(/^Từ (\d+) năm$/, '$1+ years');
  }
  return out;
}

async function readJobs(file) {
  try {
    return new Map(JSON.parse(await readFile(file, 'utf8')).jobs.map((j) => [j.id, j]));
  } catch {
    return new Map();
  }
}

const downModels = new Set();
const usedModels = new Set();

async function chat(messages) {
  for (const model of MODELS) {
    if (downModels.has(model)) continue;
    const res = await fetch(API_BASE + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + API_KEY },
      body: JSON.stringify({ model, messages, temperature: 0.3 }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    const body = await res.text();
    // The gateway answers 503 (or 404) when it has no working channel for the model.
    if (res.status === 503 || res.status === 404) {
      if (!downModels.has(model)) console.warn(`  model ${model} is unavailable (HTTP ${res.status}), trying the next one`);
      downModels.add(model);
      continue;
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      err.fatal = [401, 402, 403].includes(res.status); // a bad key or an empty balance fails every call alike
      throw err;
    }
    const text = JSON.parse(body).choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('empty reply');
    usedModels.add(model);
    return text;
  }
  const err = new Error('no model is available: ' + MODELS.join(', '));
  err.fatal = true;
  throw err;
}

function parseReply(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('no JSON in reply');
  return JSON.parse(text.slice(start, end + 1));
}

// What is wrong with a translation; empty when it can be used.
function problemsOf(src, out, to) {
  const isText = (t) => typeof t === 'string';
  if (!out || !isText(out.desc) || !Array.isArray(out.duties) || !Array.isArray(out.requirements)) return ['not the input structure'];
  const problems = [];
  if (out.duties.length !== src.duties.length) problems.push(`duties has ${out.duties.length} items, expected ${src.duties.length}`);
  if (out.requirements.length !== src.requirements.length) {
    problems.push(`requirements has ${out.requirements.length} groups, expected ${src.requirements.length}`);
  } else {
    src.requirements.forEach((r, k) => {
      const o = out.requirements[k];
      if (!o || !isText(o.title) || !Array.isArray(o.items) || o.items.length !== r.items.length) {
        problems.push(`requirements[${k}] must have a title and ${r.items.length} items`);
      }
    });
  }
  if (problems.length) return problems;

  const srcTexts = textsOf(src);
  const outTexts = textsOf(out);
  if (outTexts.some((t, k) => !isText(t) || (srcTexts[k].trim() && !t.trim()))) return ['some texts are empty or not strings'];
  const kept = new Set(techIn(outTexts.join('\n')));
  const lost = techIn(srcTexts.join('\n')).filter((t) => !kept.has(t));
  if (lost.length) problems.push('these names must stay as written: ' + lost.join(', '));
  if (languageOf(outTexts) !== to) problems.push(`the text is not in ${LANG_NAME[to]}`);
  const ratio = outTexts.join('').length / srcTexts.join('').length;
  if (ratio < 0.5 || ratio > 2.5) problems.push('the translation is much shorter or longer than the original');
  return problems;
}

async function translate(content, from, to) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Translate from ${LANG_NAME[from]} into ${LANG_NAME[to]}:\n${JSON.stringify(content, null, 2)}` }
  ];
  let last = '';
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const reply = await chat(messages);
    let out = null;
    let problems;
    try {
      out = parseReply(reply);
      problems = problemsOf(content, out, to);
    } catch (err) {
      problems = ['the reply is not valid JSON (' + err.message + ')'];
    }
    if (!problems.length) return out;
    last = problems.join('; ');
    messages.push({ role: 'assistant', content: reply }, { role: 'user', content: `That reply cannot be used: ${last}. Reply again with the full JSON, following every rule.` });
  }
  throw new Error(last);
}

async function runPool(items, limit, fn) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

const src = JSON.parse(await readFile(SRC, 'utf8'));
const prev = { vi: await readJobs(OUT.vi), en: await readJobs(OUT.en) };
const result = { vi: [], en: [] };
const todo = [];
let reused = 0;

src.jobs.forEach((job, i) => {
  const content = contentOf(job);
  const from = languageOf(textsOf(content));
  const to = from === 'vi' ? 'en' : 'vi';
  const hash = hashOf(content);
  result[from][i] = { ...job, i18n: { source: from, hash, translated: false } };
  // Copy the job's other fields from the source (deadline, closed...) and only the prose from the old translation.
  const old = prev[to].get(job.id);
  if (old?.i18n?.translated && old.i18n.hash === hash) {
    result[to][i] = { ...withContent(job, contentOf(old)), i18n: { source: from, hash, translated: true } };
    reused++;
  } else {
    result[to][i] = { ...job, i18n: { source: from, hash, translated: false } };
    todo.push({ i, job, content, from, to, hash });
  }
});

let translated = 0;
const failed = [];
const batch = API_KEY ? todo.slice(0, MAX_JOBS) : [];
let stop = '';
await runPool(batch, CONCURRENCY, async ({ i, job, content, from, to, hash }) => {
  if (stop) return failed.push(job.id);
  try {
    const out = await translate(content, from, to);
    result[to][i] = { ...withContent(job, out), i18n: { source: from, hash, translated: true } };
    translated++;
    console.log(`  ${from} → ${to}  ${job.id}`);
  } catch (err) {
    if (err.fatal) stop = err.message;
    failed.push(job.id);
    console.warn(`  failed  ${job.id}: ${err.message}`);
  }
});

const offices = src.offices || {};
const files = {
  vi: { ...src, jobs: result.vi },
  en: {
    ...src,
    offices: Object.fromEntries(Object.entries(offices).map(([k, v]) => [EN_LABELS[k] ?? k, EN_OFFICES[v] ?? v])),
    jobs: result.en.map(toEnglishLabels)
  }
};
for (const lang of ['vi', 'en']) await writeFile(OUT[lang], JSON.stringify(files[lang], null, 2) + '\n');

const waiting = todo.length - batch.length;
console.log(`Translated ${translated}, reused ${reused}, failed ${failed.length}` + (usedModels.size ? ` with ${[...usedModels].join(', ')}.` : '.'));
if (!API_KEY && todo.length) console.warn(`LLM_API_KEY is not set: ${todo.length} jobs stay in their posted language.`);
if (API_KEY && waiting) console.warn(`${waiting} jobs are over the per-run limit of ${MAX_JOBS} and wait for the next run.`);
if (stop) console.warn(`Stopped calling the API: ${stop}`);
