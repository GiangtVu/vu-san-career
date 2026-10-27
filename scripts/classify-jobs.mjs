// Turn the raw crawl (public/data/fptsmartcloud-jobs.json) into the site's jobs format
// (groups / offices / jobs with level, stack, detail...) and write public/data/data.json.
// Run with: node scripts/classify-jobs.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { classifyJob, isFocusJob } from './job-rules.mjs';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const RAW = path('../public/data/fptsmartcloud-jobs.json');
const BASE = path('../public/data/jobs.json');
const OUT = path('../public/data/data.json');

const HOT_COUNT = 3; // the site lists newest first; the first few are marked HOT
const DEADLINE_DAYS = 30; // the source has no deadline, so every job gets one counted from this run

function formatDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const raw = await readJson(RAW, null);
if (!raw || !raw.jobs?.length) throw new Error(`No crawled jobs in ${RAW}; run npm run crawl first.`);
if (!raw.listed?.length) throw new Error(`${RAW} has no "listed" ids; rerun npm run crawl.`);
const base = await readJson(BASE, {});
const prev = await readJson(OUT, { jobs: [] });
const prevById = new Map(prev.jobs.map((j) => [j.id, j]));
const today = formatDate(new Date());
const deadline = formatDate(new Date(Date.now() + DEADLINE_DAYS * 86400000));

// The crawler already keeps only focus jobs; filter again in case of an older crawl file.
// `postedAt` is the first run that saw the job, kept across runs (the source shows no post date).
const open = raw.jobs
  .map((src) => classifyJob(src, deadline))
  .filter(isFocusJob)
  .map(({ id, ...rest }, i) => ({ id, hot: i < HOT_COUNT, postedAt: prevById.get(id)?.postedAt || today, ...rest }));
if (!open.length) throw new Error('No crawled job matches the focus topics.');

// A job from the last run that is gone from the source listing has closed: keep it, marked closed,
// so links to it still open its page. Jobs still listed but no longer matching the focus rules are dropped.
const openIds = new Set(open.map((j) => j.id));
const listed = new Set(raw.listed);
const closed = prev.jobs
  .filter((j) => !openIds.has(j.id) && (j.closed || !listed.has(j.id)))
  .map((j) => (j.closed ? j : { ...j, hot: false, closed: true, closedAt: today }));
const jobs = open.concat(closed);

const groups = base.groups || {};
const used = new Set(jobs.map((j) => j.group));
const out = {
  groups: Object.fromEntries(Object.entries(groups).filter(([k]) => used.has(k))),
  offices: base.offices || {},
  jobs
};

await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
const count = (key) => Object.entries(open.reduce((m, j) => ({ ...m, [j[key]]: (m[j[key]] || 0) + 1 }), {})).map(([k, n]) => `${k}=${n}`).join(' ');
console.log(`Saved ${open.length} open and ${closed.length} closed jobs to ${OUT}\n  groups: ${count('group')}\n  levels: ${count('level')}\n  locations: ${count('location')}`);
