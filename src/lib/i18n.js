// The site shows every post in Vietnamese. data.json keeps each post as written; a post written
// in English has its Vietnamese translation in data.vi.json (scripts/translate-jobs.mjs).
// Shared by the app (lib/jobs.jsx) and scripts/prerender.mjs, so the prerendered HTML and the
// hydrating app render the same text.

// data.json with the translated prose of each translated job swapped in. Only the prose is taken
// from the translation; everything else (deadline, closed...) stays as data.json has it.
// Without translations (`vi` null) the posts stay as written.
export function withVietnamese(data, vi) {
  const translated = new Map(((vi && vi.jobs) || []).map((j) => [j.id, j]));
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
