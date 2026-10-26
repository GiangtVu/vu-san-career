import { createContext, useContext, useEffect, useState } from 'react';

// Lowercase and strip Vietnamese diacritics so "phân tích" matches "phan tich".
export function norm(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
}

// "30/11/2026" -> "20261130", sortable as a string.
export function dateKey(d) {
  return d.split('/').reverse().join('');
}

export function parseDate(d) {
  const [day, month, year] = d.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function hotFirst(list) {
  return list.slice().sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
}

export function matches(job, q) {
  return !q || job.searchText.includes(q);
}

export function jobPath(id) {
  return '/viec-lam/' + encodeURIComponent(id);
}

// Job list URL carrying the current keyword and group, read back by the list page.
export function listPath(q, group) {
  const params = new URLSearchParams();
  if (q && q.trim()) params.set('q', q.trim());
  if (group) params.set('group', group);
  const query = params.toString();
  return '/viec-lam' + (query ? '?' + query : '');
}

export const CONTACT = {
  email: 'vugt2@fpt.com',
  zalo: 'https://zalo.me/0973084280',
  phone: '0973 084 280',
  linkedin: 'https://www.linkedin.com/in/gtv195/',
  facebook: 'https://www.facebook.com/gtv195/'
};

// Jobs, groups and office addresses are loaded once from public/data/jobs.json.
const JobsContext = createContext(null);

function prepare(data) {
  const groups = data.groups || {};
  const jobs = (data.jobs || []).map((j) => {
    const job = { stack: [], keywords: '', hot: false, ...j };
    job.searchText = norm([job.title, job.desc, job.keywords, job.stack.join(' '),
      groups[job.group] ? groups[job.group].label : '', job.level, job.location].join(' '));
    return job;
  });
  return { groups, jobs, offices: data.offices || {} };
}

export function JobsProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let alive = true;
    fetch(import.meta.env.BASE_URL + 'data/jobs.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((json) => alive && setState({ status: 'ready', data: prepare(json) }))
      .catch(() => alive && setState({ status: 'error', data: null }));
    return () => { alive = false; };
  }, []);

  return <JobsContext.Provider value={state}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  return useContext(JobsContext);
}

export function LoadState({ status }) {
  if (status === 'error') {
    return <div className="load-state load-state--error" role="alert">Không tải được danh sách việc làm. Vui lòng tải lại trang.</div>;
  }
  return <div className="load-state" aria-busy="true">Đang tải danh sách việc làm…</div>;
}
