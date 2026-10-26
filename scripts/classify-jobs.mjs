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
const base = await readJson(BASE, {});
const deadline = formatDate(new Date(Date.now() + DEADLINE_DAYS * 86400000));

// The crawler already keeps only focus jobs; filter again in case of an older crawl file.
const jobs = raw.jobs
  .map((src) => classifyJob(src, deadline))
  .filter(isFocusJob)
  .map(({ id, ...rest }, i) => ({ id, hot: i < HOT_COUNT, ...rest }));
if (!jobs.length) throw new Error('No crawled job matches the focus topics.');

const groups = base.groups || {};
const used = new Set(jobs.map((j) => j.group));
const out = {
  groups: Object.fromEntries(Object.entries(groups).filter(([k]) => used.has(k))),
  offices: base.offices || {},
  jobs
};

await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
const count = (key) => Object.entries(jobs.reduce((m, j) => ({ ...m, [j[key]]: (m[j[key]] || 0) + 1 }), {})).map(([k, n]) => `${k}=${n}`).join(' ');
console.log(`Saved ${jobs.length} jobs to ${OUT}\n  groups: ${count('group')}\n  levels: ${count('level')}\n  locations: ${count('location')}`);
