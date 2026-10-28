// The site shows in Vietnamese or English (lib/lang.jsx). data.json keeps each post as written;
// a post written in English has its Vietnamese translation in data.vi.json and one written in
// Vietnamese has its English translation in data.en.json (scripts/translate-jobs.mjs).
// Shared by the app (lib/jobs.jsx) and scripts/prerender.mjs, so the prerendered HTML and the
// hydrating app render the same text. Plain JS without JSX so Node can import it.

// data.json with the translated prose of each translated job swapped in. Only the prose is taken
// from the translation; everything else (deadline, closed...) stays as data.json has it.
// Without translations (`tr` null) the posts stay as written.
function withProse(data, tr) {
  const translated = new Map(((tr && tr.jobs) || []).map((j) => [j.id, j]));
  return {
    ...data,
    jobs: (data.jobs || []).map((job) => {
      const t = translated.get(job.id);
      if (!t || !t.detail || !job.detail) return job;
      const detail = { ...job.detail, duties: t.detail.duties };
      if (job.detail.requirements) detail.requirements = t.detail.requirements;
      return { ...job, desc: t.desc, detail };
    })
  };
}

export function withVietnamese(data, vi) {
  return withProse(data, vi);
}

// The classifier writes these labels in Vietnamese. Locations stay as written in the data,
// since filters and office addresses are keyed by them; they're translated where shown.
const EN_LABELS = {
  'Thỏa thuận': 'Negotiable',
  'Toàn thời gian': 'Full-time',
  'Thực tập / Cộng tác viên': 'Internship / Freelance'
};
const EN_OFFICES = {
  'Tầng 22, Vinacomin Tower, 3 Dương Đình Nghệ, Cầu Giấy, Hà Nội': 'Floor 22, Vinacomin Tower, 3 Duong Dinh Nghe, Cau Giay, Hanoi'
};

export function withEnglish(data, en) {
  const out = withProse(data, en);
  return {
    ...out,
    offices: Object.fromEntries(Object.entries(out.offices || {}).map(([k, v]) => [k, EN_OFFICES[v] || v])),
    jobs: out.jobs.map((job) => {
      const j = { ...job, salary: EN_LABELS[job.salary] || job.salary };
      if (job.detail) {
        j.detail = { ...job.detail };
        if (job.detail.type) j.detail.type = EN_LABELS[job.detail.type] || job.detail.type;
        if (job.detail.experience) j.detail.experience = job.detail.experience.replace(/^Từ (\d+) năm$/, '$1+ years');
      }
      return j;
    })
  };
}

// Place names: [short, long] per language. Short on cards and tags, long in pickers and addresses.
const PLACES = {
  'Hà Nội': { vi: ['Hà Nội', 'Hà Nội'], en: ['Hanoi', 'Hanoi'] },
  'TP. HCM': { vi: ['TP. HCM', 'TP. Hồ Chí Minh'], en: ['HCMC', 'Ho Chi Minh City'] }
};

export function placeShort(place, lang = 'vi') {
  return PLACES[place] ? PLACES[place][lang][0] : place;
}

export function placeLabel(place, lang = 'vi') {
  return PLACES[place] ? PLACES[place][lang][1] : place;
}

// A job hiring in several places has a location like "Hà Nội / TP. HCM".
export function locationText(location, lang = 'vi') {
  return location.split(' / ').map((p) => placeShort(p, lang)).join(' / ');
}
