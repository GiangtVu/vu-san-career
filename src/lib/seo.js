// Page titles and descriptions, shared by the app (document.title) and scripts/prerender.mjs
// (the HTML each URL is served with, in Vietnamese), so search engines and the running app agree.
// Plain JS without JSX so Node can import it.
import { locationText } from './i18n.js';

export const SITE_NAME = 'Vũ San Careers';

export const HOME_TITLE = {
  vi: 'Vũ San Careers · Tuyển dụng FPT Smart Cloud',
  en: 'Vũ San Careers · Jobs at FPT Smart Cloud'
};
export const LIST_TITLE = {
  vi: 'Việc làm FPT Smart Cloud đang tuyển · Vũ San Careers',
  en: 'Open roles at FPT Smart Cloud · Vũ San Careers'
};
export const NOT_FOUND_TITLE = {
  vi: 'Không tìm thấy trang · Vũ San Careers',
  en: 'Page not found · Vũ San Careers'
};

export function jobTitle(job, lang = 'vi') {
  const en = lang === 'en';
  if (job.closed) return job.title + (en ? ' (No longer hiring) · ' : ' (Đã ngừng tuyển) · ') + SITE_NAME;
  return job.title + ' · ' + locationText(job.location, lang) + (en ? ' | Jobs at FPT Smart Cloud' : ' | Tuyển dụng FPT Smart Cloud');
}

export function jobDescription(job) {
  const lead = job.closed
    ? `${job.title} tại FPT Smart Cloud đã ngừng tuyển.`
    : `FPT Smart Cloud tuyển ${job.title}, ${job.level}, ${job.location}, lương ${(job.salary || 'Thỏa thuận').toLowerCase()}.`;
  const text = (lead + ' ' + (job.desc || '')).trim();
  return text.length <= 160 ? text : text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}
