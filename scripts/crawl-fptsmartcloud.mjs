// Crawl job openings from https://fptsmartcloud.com/co-hoi-nghe-nghiep/ about the site's focus topics into
// public/data/fptsmartcloud-jobs.json. Run with: node scripts/crawl-fptsmartcloud.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { classifyJob, isFocusJob, mayBeFocus } from './job-rules.mjs';

const BASE = 'https://fptsmartcloud.com/co-hoi-nghe-nghiep/';
const OUT = fileURLToPath(new URL('../public/data/fptsmartcloud-jobs.json', import.meta.url));
const MAX_PAGES = 50;
const CONCURRENCY = 4;

async function fetchHtml(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; vu-san-career-crawler)' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.text();
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const clean = (t) => t.replace(/\s+/g, ' ').trim();

// Cloudflare hides emails as hex in data-cfemail: first byte is the XOR key.
function decodeCfEmail(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

// Card summary is "Position: X<br>Department: Y<br>Location: Z" (or the Vietnamese labels).
const SUMMARY_KEYS = {
  position: 'position', 'vị trí': 'position',
  department: 'department', 'phòng': 'department',
  location: 'location', 'địa điểm': 'location'
};

function parseSummary($, el) {
  const summary = {};
  const lines = ($(el).html() || '').split(/<br\s*\/?>/i).map((l) => clean(load(l).text()));
  for (const line of lines) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    const key = m && SUMMARY_KEYS[m[1].trim().toLowerCase()];
    if (key) summary[key] = m[2];
  }
  return summary;
}

async function crawlList() {
  const jobs = new Map();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const $ = load(await fetchHtml(page === 1 ? BASE : `${BASE}page/${page}/`));
    const cards = $('.bota_job_opportunities_it');
    if (!cards.length) break;
    cards.each((_, card) => {
      const link = $(card).find('.bota_job_opportunities_title a');
      const url = link.attr('href');
      const id = url && url.match(/job_opportunity\/([^/]+)/)?.[1];
      if (!id || jobs.has(id)) return;
      jobs.set(id, {
        id,
        url,
        title: clean(link.text()),
        image: $(card).find('.bota_job_opportunities_img img').attr('src') || null,
        ...parseSummary($, $(card).find('.bota_job_opportunities_desc'))
      });
    });
  }
  return [...jobs.values()];
}

// Section headings are written either as <h5> or as a paragraph that is entirely bold.
function isSectionHeading($, el, tag) {
  if (tag === 'h5') return true;
  if (tag !== 'p') return false;
  const text = clean($(el).text());
  const bold = clean($(el).find('strong, b').text());
  return text.length > 0 && text.length <= 80 && bold === text;
}

// Split the detail body into sections at each heading; <h3>/<h4> inside a section start a sub-group.
function parseDetail(html) {
  const $ = load(html);
  $('[data-cfemail]').each((_, el) => { $(el).replaceWith(decodeCfEmail($(el).attr('data-cfemail'))); });
  // Some posts wrap part of the body in extra <div>s; flatten them into one block list.
  const blocks = [];
  const flatten = (el) => $(el).children().each((_, c) => (c.tagName.toLowerCase() === 'div' ? flatten(c) : blocks.push(c)));
  flatten($('.bota_job_deatils_desc').first());

  const sections = [];
  let section = { title: null, text: [], groups: [] };
  let group = null;

  // Some posts repeat a block (e.g. "Working Environment") twice; keep the first copy.
  const seen = new Set();
  const push = () => {
    const key = JSON.stringify(section);
    if ((section.title || section.text.length || section.groups.length) && !seen.has(key)) {
      seen.add(key);
      sections.push(section);
    }
  };

  blocks.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (isSectionHeading($, el, tag)) {
      push();
      section = { title: clean($(el).text()), text: [], groups: [] };
      group = null;
    } else if (/^h[1-6]$/.test(tag)) {
      group = { title: clean($(el).text()), items: [] };
      section.groups.push(group);
    } else if (tag === 'ul' || tag === 'ol') {
      if (!group) {
        group = { title: null, items: [] };
        section.groups.push(group);
      }
      // Only top-level items; nested lists are folded into their parent's text.
      // A <br> followed by a typed marker starts a sub-item ("…theo từng lớp:<br>– API testing");
      // any other <br> just continues the same item.
      $(el).children('li').each((_, li) => {
        $(li).find('br').replaceWith('\n');
        const items = [];
        for (const line of $(li).text().split('\n').map(clean)) {
          if (!line) continue;
          if (items.length && !/^[–—•·]/.test(line)) items[items.length - 1] += ' ' + line;
          else items.push(line);
        }
        group.items.push(...items);
      });
    } else {
      // <br> separates lines inside one paragraph (e.g. the contact block).
      $(el).find('br').replaceWith('\n');
      for (const line of $(el).text().split('\n').map(clean)) if (line) section.text.push(line);
      group = null;
    }
  });
  push();
  return { title: clean($('.bota_job_deatils_title h1').text()), sections };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

const list = await crawlList();
if (!list.length) throw new Error('No jobs found on the listing page; the site layout may have changed.');

// Keep only jobs about the site's focus topics (see FOCUS in job-rules.mjs). Jobs whose title
// already rules them out are skipped before their detail page is fetched.
const candidates = list.filter((job) => mayBeFocus(job.title));
const detailed = await mapLimit(candidates, CONCURRENCY, async (job) => {
  const detail = parseDetail(await fetchHtml(job.url));
  return { ...job, title: detail.title || job.title, sections: detail.sections };
});
const jobs = detailed.filter((job) => isFocusJob(classifyJob(job)));
if (!jobs.length) throw new Error(`None of the ${list.length} listed jobs matches the focus topics.`);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ source: BASE, jobs }, null, 2) + '\n');
console.log(`Saved ${jobs.length} of ${list.length} listed jobs to ${OUT} (fetched ${candidates.length} detail pages)`);
