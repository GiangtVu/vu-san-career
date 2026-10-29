// After the client and SSR builds, write every URL as a full HTML page: the page content
// rendered by React (src/entry-server.jsx), plus its own title, description, canonical,
// Open Graph tags and, for open jobs, JobPosting structured data (Google for Jobs).
// main.jsx hydrates that HTML in the browser. Also writes 404.html (the plain SPA shell),
// sitemap.xml and robots.txt. Vercel serves /viec-lam/<id> from dist/viec-lam/<id>.html
// (cleanUrls in vercel.json). Run with: npm run build.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { HOME_TITLE, LIST_TITLE, NOT_FOUND_TITLE, SITE_NAME, jobDescription, jobTitle } from '../src/lib/seo.js';
import { withVietnamese } from '../src/lib/i18n.js';

// React picks its build from NODE_ENV when first loaded, so set it before importing the
// SSR bundle: the production build renders faster and without dev-only warnings.
process.env.NODE_ENV = 'production';
const { render: renderApp } = await import(new URL('../dist-server/entry-server.js', import.meta.url).href);

const SITE = (process.env.SITE_URL || 'https://www.vusan.site').replace(/\/$/, '');
const DIST = (p) => fileURLToPath(new URL('../dist/' + p, import.meta.url));
// Facebook/Zalo cache the preview by image URL, so version it by content: a new image
// gets a new URL and is fetched again.
const OG_IMAGE_FILE = '/img/og-share.jpg';
const OG_IMAGE_VERSION = createHash('md5').update(await readFile(DIST(OG_IMAGE_FILE.slice(1)))).digest('hex').slice(0, 8);
// A 1200×630 JPEG (quality 82, 4:2:0, progressive, ~110 KB) so link previews load quickly.
const OG_IMAGE = {
  path: `${OG_IMAGE_FILE}?v=${OG_IMAGE_VERSION}`,
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Vũ San, phụ trách tuyển dụng tại FPT Smart Cloud'
};
const LIST_DESCRIPTION = 'Danh sách việc làm FPT Smart Cloud đang tuyển: Engineering, AI & Data, Product & Business, DevOps. Lọc theo nhóm, cấp bậc, địa điểm và kỹ năng.';

const EMPLOYMENT_TYPES = { 'toàn thời gian': 'FULL_TIME', 'bán thời gian': 'PART_TIME', 'thực tập': 'INTERN' };
const PLACES = {
  'Hà Nội': { addressLocality: 'Hà Nội', addressRegion: 'Hà Nội' },
  'TP. HCM': { addressLocality: 'Thành phố Hồ Chí Minh', addressRegion: 'Hồ Chí Minh' }
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "30/11/2026" -> "2026-11-30"
const isoDate = (d) => d.split('/').reverse().join('-');
const today = new Date().toISOString().slice(0, 10);

function jobPostingHtml(job) {
  const d = job.detail || {};
  const list = (items) => '<ul>' + items.map((t) => `<li>${esc(t)}</li>`).join('') + '</ul>';
  let html = `<p>${esc(job.desc)}</p>`;
  if (d.duties) html += '<p><strong>Mô tả công việc</strong></p>' + list(d.duties);
  for (const r of d.requirements || []) html += `<p><strong>${esc(r.title)}</strong></p>` + list(r.items);
  return html;
}

function jobPosting(job, offices, url) {
  const d = job.detail || {};
  const places = job.location.split(' / ');
  const posting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: jobPostingHtml(job),
    identifier: { '@type': 'PropertyValue', name: 'FPT Smart Cloud', value: job.id },
    datePosted: job.postedAt ? isoDate(job.postedAt) : today,
    validThrough: isoDate(job.deadline) + 'T23:59:59+07:00',
    hiringOrganization: { '@type': 'Organization', name: 'FPT Smart Cloud', sameAs: 'https://fptsmartcloud.com' },
    directApply: false,
    url
  };
  const type = d.type && EMPLOYMENT_TYPES[d.type.toLowerCase()];
  if (type) posting.employmentType = type;
  const years = d.experience && d.experience.match(/\d+/);
  if (years) posting.experienceRequirements = { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: Number(years[0]) * 12 };
  const located = places.filter((p) => PLACES[p]);
  if (located.length) {
    posting.jobLocation = located.map((p) => ({
      '@type': 'Place',
      address: { '@type': 'PostalAddress', ...(offices[p] ? { streetAddress: offices[p] } : {}), ...PLACES[p], addressCountry: 'VN' }
    }));
  }
  if (places.includes('Remote')) {
    posting.jobLocationType = 'TELECOMMUTE';
    posting.applicantLocationRequirements = { '@type': 'Country', name: 'Vietnam' };
  }
  return posting;
}

// The built index.html with this page's head tags in place of the generic ones and, unless
// it's the 404 page, the page content rendered into #root.
function render(template, appData, { path, title, description, robots, jsonLd }) {
  const url = SITE + path;
  const tags = [
    path !== null && `<link rel="canonical" href="${esc(url)}">`,
    // main.jsx needs the jobs data before it can hydrate; start loading it with the page.
    path !== null && '<link rel="preload" href="/data/data.json" as="fetch" crossorigin>',
    path !== null && '<link rel="preload" href="/data/data.vi.json" as="fetch" crossorigin>',
    path !== null && '<link rel="preload" href="/data/data.en.json" as="fetch" crossorigin>',
    robots && `<meta name="robots" content="${robots}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="vi_VN">',
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    path !== null && `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${SITE + OG_IMAGE.path}">`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}">`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}">`,
    `<meta property="og:image:type" content="${OG_IMAGE.type}">`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE.alt)}">`,
    '<meta name="twitter:card" content="summary">',
    // "<" escaped so text inside the JSON can't close the script tag.
    jsonLd && `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
  ].filter(Boolean).join('\n');
  // Replacer functions, so a "$" in job text isn't read as a replacement pattern.
  let html = template
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(description)}">\n${tags}`);
  if (path !== null) {
    const body = renderApp(path, appData);
    html = html.replace(ROOT, () => `<div id="root" data-ssr="${esc(path)}">${body}</div>`);
  }
  return html;
}

const ROOT = '<div id="root"></div>';

const template = await readFile(DIST('index.html'), 'utf8');
if (!template.includes('<meta name="description"')) throw new Error('dist/index.html has no description meta to replace.');
if (!template.includes(ROOT)) throw new Error(`dist/index.html has no ${ROOT} to render into.`);
// The same files the app loads (lib/jobs.jsx), so hydration matches the HTML. Pages render in
// Vietnamese, and the tags and structured data use the Vietnamese text too.
const readJson = async (file) => JSON.parse(await readFile(DIST(file), 'utf8'));
const raw = {
  data: await readJson('data/data.json'),
  vi: await readJson('data/data.vi.json').catch(() => null),
  en: await readJson('data/data.en.json').catch(() => null)
};
const data = withVietnamese(raw.data, raw.vi);
const homeDescription = template.match(/<meta name="description" content="([^"]*)">/)[1];

const pages = [
  { file: 'index.html', path: '/', title: HOME_TITLE.vi, description: homeDescription },
  { file: 'viec-lam.html', path: '/viec-lam', title: LIST_TITLE.vi, description: LIST_DESCRIPTION },
  // Served for any unknown URL with a 404 status; the app shows its not-found page.
  { file: '404.html', path: null, title: NOT_FOUND_TITLE.vi, description: homeDescription, robots: 'noindex' }
];
for (const job of data.jobs) {
  if (!/^[\w-]+$/.test(job.id)) {
    console.warn(`Skipping job id "${job.id}": not safe as a file name.`);
    continue;
  }
  const path = '/viec-lam/' + job.id;
  pages.push({
    file: `viec-lam/${job.id}.html`,
    path,
    title: jobTitle(job),
    description: jobDescription(job),
    // Closed jobs keep their page for old links but leave the index and carry no JobPosting.
    robots: job.closed ? 'noindex, follow' : null,
    jsonLd: job.closed ? null : jobPosting(job, data.offices || {}, SITE + path),
    open: !job.closed
  });
}

await mkdir(DIST('viec-lam'), { recursive: true });
for (const page of pages) await writeFile(DIST(page.file), render(template, raw, page));

const indexed = pages.filter((p) => p.path !== null && !p.robots);
await writeFile(DIST('sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + indexed.map((p) => `  <url><loc>${esc(SITE + p.path)}</loc></url>`).join('\n') + '\n</urlset>\n');
await writeFile(DIST('robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

const jobs = pages.filter((p) => p.file.startsWith('viec-lam/'));
console.log(`Prerendered ${pages.length} pages (${jobs.filter((p) => p.open).length} open jobs, ${jobs.filter((p) => !p.open).length} closed); sitemap has ${indexed.length} URLs.`);
