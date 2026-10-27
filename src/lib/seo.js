// Page titles and descriptions, shared by the app (document.title) and scripts/prerender.mjs
// (the HTML each URL is served with), so search engines and the running app agree.
// Plain JS without JSX so Node can import it.

export const SITE_NAME = 'Vũ San Careers';

export const HOME_TITLE = 'Vũ San Careers · Tuyển dụng FPT Smart Cloud';
export const LIST_TITLE = 'Việc làm FPT Smart Cloud đang tuyển · Vũ San Careers';
export const NOT_FOUND_TITLE = 'Không tìm thấy trang · Vũ San Careers';

export function jobTitle(job) {
  if (job.closed) return job.title + ' (Đã ngừng tuyển) · ' + SITE_NAME;
  return job.title + ' · ' + job.location + ' | Tuyển dụng FPT Smart Cloud';
}

export function jobDescription(job) {
  const lead = job.closed
    ? `${job.title} tại FPT Smart Cloud đã ngừng tuyển.`
    : `FPT Smart Cloud tuyển ${job.title}, ${job.level}, ${job.location}, lương ${(job.salary || 'Thỏa thuận').toLowerCase()}.`;
  const text = (lead + ' ' + (job.desc || '')).trim();
  return text.length <= 160 ? text : text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}
