// Rules shared by the crawler and the classifier: turn one crawled job into the site's job format
// and decide whether it belongs to the topics the site focuses on.

// Checked in order against the title without its "(team)" suffix; first match wins.
const GROUP_RULES = [
  ['sec', /\bSOC\b|security/i],
  ['ai', /\bAI (engineer|research|consultant|solution|evaluation)|\bML ?Ops|machine learning|\bASR\b|speech|text-to-speech|\bdata (engineer|analytics|scientist)|dataops/i],
  ['biz', /project manager|program manager|product (manager|owner)|business analyst|director|IT manager|growth strategy|customer success|cloud adoption/i],
  ['sales', /sale|presale|pre-sales|business development|account manager|consultant|business enabler/i],
  ['ops', /devops|\bSRE\b|site reliability|kubernetes|cloud (engineer|support|storage|openstack|operation|platform)|network|infrastructure|system|database engineer|data center/i],
  ['eng', /engineer|developer|full-?stack|backend|frontend|tester|\bQC\b|devrel|architect/i]
];

const TECH = [
  'Python', 'Golang', 'Java', 'JavaScript', 'TypeScript', 'ReactJS', 'VueJS', 'Angular', 'Node.js', 'C++',
  'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'OpenStack', 'Ceph', 'Linux', 'AWS', 'Azure', 'GCP',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Elasticsearch', 'Qdrant', 'Spark', 'Airflow',
  'PyTorch', 'TensorFlow', 'LangChain', 'LangGraph', 'LlamaIndex', 'vLLM', 'Triton',
  'Prometheus', 'Grafana', 'Jenkins', 'GitLab', 'CI/CD', 'SQL'
];
const TECH_RE = {
  Golang: /\bgolang\b|\bgo\b(?= ?(lang|,|\/|\)))/i,
  ReactJS: /\bReact(JS|js|\.js)?\b/, // case-sensitive so the "ReAct" agent pattern doesn't match
  VueJS: /\bvue(js|\.js)?\b/i,
  'Node.js': /\bnode(js|\.js)\b/i,
  'C++': /c\+\+/i,
  'CI/CD': /\bci ?\/ ?cd\b/i,
  SQL: /\bsql\b/i
};
const techRe = (t) => TECH_RE[t] || new RegExp('\\b' + t.replace(/[.+]/g, '\\$&') + '\\b', 'i');

// Only jobs matching one of these topics are kept: the search chips in src/pages/home/Hero.jsx (SUGGESTIONS)
// plus the Product & Business roles, so the site's four groups in jobs.json are all filled.
// Tech topics count a job when its title names the tech, or when a technical job's post asks for it.
const TECH_GROUPS = ['eng', 'ai', 'ops'];
const usesTech = (job, tech) => TECH_GROUPS.includes(job.group) && (job.detail.skills || []).includes(tech);
export const FOCUS = {
  Python: (job) => /python/i.test(job.title) || usesTech(job, 'Python'),
  Golang: (job) => /golang|\bgo\b/i.test(job.title) || usesTech(job, 'Golang'),
  ReactJS: (job) => /react/i.test(job.title) || usesTech(job, 'ReactJS'),
  Data: (job) => /\bdata(?! ?center)/i.test(job.title),
  DevOps: (job) => /devops|\bSRE\b|site reliability|mlops/i.test(job.title),
  // The "Product & Business" group: the roles listed for it in jobs.json.
  Business: (job) => job.group === 'biz' && /business analyst|product (owner|manager)|project manager|program manager/i.test(job.title)
};

export const isFocusJob = (job) => Object.values(FOCUS).some((match) => match(job));

// Before the detail page is fetched only the title is known: assume a technical job asks for
// every focus tech, so this only rules out jobs that can never match.
export function mayBeFocus(title) {
  return isFocusJob({ title, group: classifyGroup(title), detail: { skills: ['Python', 'Golang', 'ReactJS'] } });
}

// Section titles that are not about the job itself.
const SKIP_RE = /benefit|quyền lợi|phúc lợi|why join|environment|địa điểm|location|contact|liên hệ|about|về fpt|company summary|team structure/i;
const REQ_RE = /require|yêu cầu|qualif|must|nice|prefer|ưu tiên|skill|kỹ năng|kinh nghiệm|experience|education|certif|prerequisite|knowledge|kiến thức|language|advantage|optional|năng lực|look for/i;

// Same as norm() in src/lib/jobs.jsx.
export const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const roleOf = (title) => title.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
const stripColon = (t) => (t || '').replace(/\s*:\s*$/, '');
const uniq = (arr) => [...new Set(arr)];

function classifyGroup(title) {
  for (const target of [roleOf(title), title]) {
    const hit = GROUP_RULES.find(([, re]) => re.test(target));
    if (hit) return hit[0];
  }
  return 'other';
}

// Largest "N years / N năm" mentioned in the requirements; for "2–5 years" the lower bound counts.
function yearsOf(text) {
  const nums = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:(?:[-–]|to|đến)\s*\d{1,2}\s*\+?\s*)?(?:years?|yrs|năm)/gi)].map((m) => Number(m[1])).filter((n) => n <= 20);
  return nums.length ? Math.max(...nums) : null;
}

function classifyLevel(title, years) {
  if (/junior|fresher|intern|\bCTV\b|\bTTS\b|\bL1\b/i.test(title)) return 'Junior';
  if (/senior|lead|manager|director|head|principal|architect|\bL3\b/i.test(title)) return 'Senior';
  if (years == null) return 'Middle';
  return years >= 5 ? 'Senior' : years >= 2 ? 'Middle' : 'Junior';
}

const CITIES = [
  ['Hà Nội', /h[aà] ?n[oộ]i|\bHN\b/i],
  ['TP. HCM', /\bHCM|h[oồ] ?ch[ií] ?minh/i],
  ['Nhật Bản', /\bJP\b|japan/i],
  ['Remote', /remote/i]
];

function normalizeLocation(raw, envText) {
  const found = CITIES.filter(([, re]) => re.test(raw || '')).map(([name]) => name);
  if (found.length) return found.join(' / ');
  const fromEnv = CITIES.filter(([, re]) => re.test(envText)).map(([name]) => name);
  return fromEnv[0] || 'Hà Nội';
}

function sectionLines(s) {
  const items = s.groups.flatMap((g) => g.items);
  return items.length ? items : s.text.filter((t) => !/:\s*$/.test(t));
}

// Some posts type their lists by hand: "– item" / "• item" lines, each block led by a plain
// sub-heading line ("Prerequisites"). Turn those into real groups and drop the typed markers.
const MARKER_RE = /^[–—\-•·*+]\s*/;
// Sub-items pasted onto one line: "theo từng lớp:– API testing…tương đương– UI testing…".
// A dash glued to the word before it (unlike a spaced " – ") starts the next sub-item.
const unglue = (line) => line.split(/(?<=\S)–\s+(?=\S)/).map((t, i) => (i ? '– ' + t : t));
function liftTypedLists(s) {
  const groups = s.groups.map((g) => ({ ...g, items: g.items.flatMap(unglue).map((t) => t.replace(MARKER_RE, '')) }));
  const lines = s.text.flatMap(unglue);
  if (!lines.some((t) => MARKER_RE.test(t))) return { ...s, groups };
  const text = [];
  let group = null;
  lines.forEach((line, i) => {
    if (MARKER_RE.test(line)) {
      if (!group) groups.push(group = { title: null, items: [] });
      group.items.push(line.replace(MARKER_RE, ''));
    } else if (MARKER_RE.test(lines[i + 1] || '')) {
      groups.push(group = { title: stripColon(line), items: [] });
    } else {
      text.push(line);
      group = null;
    }
  });
  return { ...s, text, groups };
}

function buildDetail(raw, level) {
  const job = { ...raw, sections: raw.sections.map(liftTypedLists) };
  const content = job.sections.filter((s) => s.title && !SKIP_RE.test(s.title));
  const reqSections = content.filter((s) => REQ_RE.test(s.title));
  const dutySections = content.filter((s) => !REQ_RE.test(s.title));

  let duties = uniq(dutySections.flatMap(sectionLines));
  // Posts without usable headings: fall back to everything that isn't boilerplate.
  if (!duties.length) duties = uniq(job.sections.filter((s) => !s.title || !SKIP_RE.test(s.title)).flatMap(sectionLines)).slice(0, 15);

  // Blocks with the same title ("Prerequisites" / "Prerequisites:") are merged; the page keys them by title.
  const requirements = [];
  const addRequirement = (rawTitle, lines) => {
    const title = stripColon(rawTitle);
    const items = uniq(lines);
    if (!items.length) return;
    const prev = requirements.find((r) => r.title === title);
    if (prev) prev.items = uniq(prev.items.concat(items));
    else requirements.push({ title, items });
  };
  for (const s of reqSections) {
    for (const g of s.groups) addRequirement(g.title || s.title, g.items);
    if (!s.groups.length) addRequirement(s.title, s.text);
  }

  const allText = job.sections.flatMap((s) => [s.title || '', ...s.text, ...s.groups.flatMap((g) => [g.title || '', ...g.items])]).join('\n');
  const reqText = requirements.flatMap((r) => r.items).join('\n') || allText;
  const years = yearsOf(reqText);
  const skills = TECH.filter((t) => techRe(t).test(allText));

  const detail = {
    type: /\bCTV\b|\bTTS\b|intern|thực tập/i.test(job.title) ? 'Thực tập / Cộng tác viên' : 'Toàn thời gian',
    duties
  };
  if (job.department) detail.department = job.department;
  if (years != null) detail.experience = `Từ ${years} năm`;
  if (requirements.length) detail.requirements = requirements;
  if (skills.length) detail.skills = skills;
  return { detail, skills, allText, level: level ?? classifyLevel(job.title, years) };
}

function shortDesc(duties) {
  const first = (duties[0] || '').replace(/^[^:]{1,40}:\s*/, ''); // drop a "Model Development:" style lead-in
  const sentence = first.split(/(?<=\.)\s/)[0];
  if (sentence.length <= 160) return sentence;
  return sentence.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

// One crawled job (from crawl-fptsmartcloud.mjs) in the site's jobs.json shape, without `hot`.
export function classifyJob(src, deadline) {
  const { detail, skills, allText } = buildDetail(src);
  const group = classifyGroup(src.title);
  const level = classifyLevel(src.title, detail.experience ? Number(detail.experience.match(/\d+/)[0]) : null);
  const envText = src.sections.filter((s) => s.title && /environment|địa điểm|location/i.test(s.title)).map((s) => sectionLines(s).join(' ')).join(' ') || allText;
  return {
    id: src.id,
    group,
    title: src.title.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'),
    level,
    salary: 'Thỏa thuận',
    deadline,
    location: normalizeLocation(src.location, envText),
    desc: shortDesc(detail.duties),
    stack: skills.slice(0, 5),
    keywords: norm(uniq([roleOf(src.title), src.department || '', ...skills]).join(' ')),
    source: src.url,
    detail
  };
}
