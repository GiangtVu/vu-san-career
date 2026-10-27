import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/jobs.css';
import Icon from '../components/Icon.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import { LIST_TITLE } from '../lib/seo.js';
import { useHydrated } from '../lib/hooks.js';
import { CONTACT, dateKey, hotFirst, jobPath, LoadState, matches, norm, parseDate, placeLabel, placesOf, skillsOf, useJobs } from '../lib/jobs.jsx';

const PER_PAGE = 6;
const LEVELS = ['Junior', 'Middle', 'Senior'];
const POPULAR = ['Python', 'AI', 'Data', 'DevOps', 'ReactJS'];
const GROUP_ICONS = { eng: 'code-sm', ai: 'chip', biz: 'briefcase', ops: 'cloud' };
const URGENT_DAYS = 25; // deadline this close gets the "Sắp hết hạn" badge

const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));

function isUrgent(deadline) {
  const days = (parseDate(deadline) - new Date()) / 86400000;
  return days >= 0 && days <= URGENT_DAYS;
}

// Location picker in the hero search: a button that opens a list of places with job counts.
// `options` is [{ value, label, n }], the first one being "all places" (value '').
function LocationPicker({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div className="jl-loc" ref={ref} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
      <button
        type="button"
        className={'jl-loc__btn' + (open ? ' is-open' : '')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={'Địa điểm làm việc: ' + current.label}
        onClick={() => setOpen(!open)}
      >
        <Icon name="pin" className="jl-loc__pin" />
        <span className="jl-loc__text">
          <span className="jl-loc__eyebrow">Địa điểm</span>
          <span className="jl-loc__value">{current.label}</span>
        </span>
        <Icon name="chevron-down" size={18} sw={2.2} className="jl-loc__chev" />
      </button>
      {open && (
        <div className="jl-dd">
          <span className="jl-dd__title">Chọn địa điểm làm việc</span>
          <div className="jl-dd__list">
            {options.map((o) => {
              const sel = o.value === current.value;
              return (
                <button key={o.value || 'all'} type="button" className="jl-opt" aria-pressed={sel} onClick={() => { onChange(o.value); setOpen(false); }}>
                  <span className="jl-opt__icon"><Icon name={o.value ? 'pin' : 'globe'} size={18} /></span>
                  <span className="jl-opt__text">
                    <span className="jl-opt__label">{o.label}</span>
                    <span className="jl-opt__n">{o.n} vị trí đang tuyển</span>
                  </span>
                  {sel && <Icon name="check" size={18} sw={2.6} className="jl-opt__check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobList() {
  const { status, data } = useJobs();
  const jobs = data ? data.jobs : [];
  const groups = data ? data.groups : {};
  const [params] = useSearchParams();
  const resultsRef = useRef(null);
  const hydrated = useHydrated(); // the "Sắp hết hạn" badge depends on today's date

  const initialQ = params.get('q') || '';
  const [draft, setDraft] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [sel, setSel] = useState(() => ({
    groups: params.get('group') ? [params.get('group')] : [],
    levels: [],
    loc: '',
    hotOnly: false,
    skill: params.get('skill') || '' // set by the skill tags on a job page
  }));
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { document.title = LIST_TITLE; }, []);

  // Any filter change returns to the first page.
  const update = (patch) => { setSel((s) => ({ ...s, ...patch })); setPage(1); };
  const search = (value) => { setDraft(value); setQ(value); setPage(1); };
  const clearAll = () => {
    setSel({ groups: [], levels: [], loc: '', hotOnly: false, skill: '' });
    setDraft('');
    setQ('');
    setPage(1);
  };

  const locations = useMemo(() => Array.from(new Set(jobs.flatMap(placesOf))), [jobs]);
  const locOptions = [{ value: '', label: 'Tất cả địa điểm', n: jobs.length }].concat(locations.map((l) => ({
    value: l,
    label: placeLabel(l),
    n: jobs.filter((j) => placesOf(j).includes(l)).length
  })));

  const nq = norm(q.trim());
  let list = jobs.filter((j) =>
    (!sel.groups.length || sel.groups.includes(j.group))
    && (!sel.levels.length || sel.levels.includes(j.level))
    && (!sel.loc || placesOf(j).includes(sel.loc))
    && (!sel.hotOnly || j.hot)
    && (!sel.skill || skillsOf(j).includes(sel.skill))
    && matches(j, nq));
  list = sort === 'deadline'
    ? list.slice().sort((a, b) => dateKey(a.deadline).localeCompare(dateKey(b.deadline)))
    : hotFirst(list);

  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pageCount);
  const visible = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const toResults = () => {
    if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const goTo = (n) => { setPage(n); toResults(); };
  // A level or place tag on a card narrows the list to it.
  const filterBy = (patch) => { update(patch); toResults(); };

  const active = [];
  if (q.trim()) active.push({ key: 'q', label: '“' + q.trim() + '”', remove: () => search('') });
  if (sel.skill) active.push({ key: 'skill', label: 'Kỹ năng: ' + sel.skill, remove: () => update({ skill: '' }) });
  sel.groups.forEach((g) => groups[g] && active.push({ key: 'g-' + g, label: groups[g].label, remove: () => update({ groups: sel.groups.filter((x) => x !== g) }) }));
  sel.levels.forEach((l) => active.push({ key: 'l-' + l, label: l, remove: () => update({ levels: sel.levels.filter((x) => x !== l) }) }));
  if (sel.loc) active.push({ key: 'loc', label: sel.loc, remove: () => update({ loc: '' }) });
  if (sel.hotOnly) active.push({ key: 'hot', label: 'HOT', remove: () => update({ hotOnly: false }) });
  const hasFilter = active.length > 0;

  return (
    <div className="pg jl-page">
      <SiteHeader wide navClass="u-wide" cvHref="#lien-he" />

      <section className="jl-hero">
        {/* Decorations are clipped in their own layer so the location list can hang below the hero. */}
        <div className="jl-hero__bg" aria-hidden="true">
          <svg className="jl-hero__pattern" width="420" height="320">
            <defs>
              <pattern id="jl-pat" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M22 4L40 22L22 40L4 22Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M22 15L29 22L22 29L15 22Z" fill="#FFFFFF" />
              </pattern>
            </defs>
            <rect width="420" height="320" fill="url(#jl-pat)" />
          </svg>
          <span className="jl-hero__deco"></span>
        </div>
        <div className="container container--wide jl-hero__inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Việc làm</span>
          </nav>
          <div className="jl-hero__titles">
            <span className="jl-hero__script u-wide">Bước tiếp theo trong sự nghiệp của bạn</span>
            <h1>Tìm việc làm tại <span className="nowrap">FPT Smart Cloud</span></h1>
          </div>

          <form className="jl-search" role="search" onSubmit={(e) => { e.preventDefault(); search(draft); }}>
            <label className="jl-search__kw">
              <Icon name="search" size={22} />
              <span className="sr-only">Từ khóa</span>
              <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Vị trí, kỹ năng hoặc công nghệ…" />
            </label>
            <LocationPicker value={sel.loc} options={locOptions} onChange={(loc) => update({ loc })} />
            <button type="submit" className="jl-search__btn" aria-label="Tìm kiếm">
              <span className="u-wide">Tìm kiếm</span>
              <Icon name="search" size={22} sw={2.2} className="u-compact" />
            </button>
          </form>

          <div className="jl-popular">
            <span>Phổ biến:</span>
            {POPULAR.map((p) => (
              <button key={p} type="button" className="jl-popular__chip" onClick={() => search(p)}>{p}</button>
            ))}
          </div>

          {status === 'ready' && (
            <ul className="jl-stats u-wide">
              <li><strong>{jobs.length}</strong><span>vị trí đang tuyển</span></li>
              <li><strong>{jobs.filter((j) => j.hot).length}</strong><span>vị trí HOT</span></li>
              <li><strong>{Object.keys(groups).length}</strong><span>lĩnh vực</span></li>
              <li><strong>{locations.length}</strong><span>thành phố</span></li>
            </ul>
          )}
        </div>
      </section>

      <div className="container container--wide jl-body">
        <aside className={'jl-filters' + (filtersOpen ? ' is-open' : '')} aria-label="Bộ lọc">
          <div className="jl-filters__head">
            <button type="button" className="jl-filters__toggle u-compact" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
              <span className="jl-filters__title">
                <Icon name="filter" style={{ color: 'var(--blue)' }} />Bộ lọc
                {hasFilter && <span className="jl-filters__badge">{active.length}</span>}
              </span>
              <Icon name="chevron-down" sw={2.2} className="jl-filters__chev" />
            </button>
            <h2 className="jl-filters__title u-wide"><Icon name="filter" style={{ color: 'var(--blue)' }} />Bộ lọc</h2>
            {hasFilter && <button type="button" className="jl-filters__clear" onClick={clearAll}>Xóa tất cả</button>}
          </div>

          <div className="jl-filters__body">
            <fieldset className="jl-fieldset">
              <legend>Lĩnh vực</legend>
              {Object.keys(groups).map((k) => (
                <label key={k} className="jl-check">
                  <input type="checkbox" checked={sel.groups.includes(k)} onChange={() => update({ groups: toggleIn(sel.groups, k) })} />
                  <span className="jl-check__dot" style={{ background: groups[k].ink }} aria-hidden="true"></span>
                  <span className="jl-check__label">{groups[k].label}</span>
                  <span className="jl-check__n">{jobs.filter((j) => j.group === k).length}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="jl-fieldset">
              <legend>Cấp bậc</legend>
              <div className="jl-levels">
                {LEVELS.map((l) => (
                  <button key={l} type="button" className="jl-level" aria-pressed={sel.levels.includes(l)} onClick={() => update({ levels: toggleIn(sel.levels, l) })}>{l}</button>
                ))}
              </div>
            </fieldset>

            <fieldset className="jl-fieldset jl-fieldset--last">
              <legend className="sr-only">Khác</legend>
              <label className="jl-hot">
                <span className="jl-hot__label"><Icon name="fire" size={18} />Chỉ việc HOT</span>
                <input type="checkbox" checked={sel.hotOnly} onChange={() => update({ hotOnly: !sel.hotOnly })} />
              </label>
            </fieldset>
          </div>
        </aside>

        <main className="jl-results" ref={resultsRef}>
          <div className="jl-toolbar">
            <h2><span className="accent">{list.length}</span> vị trí phù hợp</h2>
            <label className="jl-sort">
              <span className="u-wide">Sắp xếp</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sắp xếp">
                <option value="hot">Nổi bật</option>
                <option value="deadline">Hạn nộp gần nhất</option>
              </select>
            </label>
          </div>

          {hasFilter && (
            <div className="jl-active">
              {active.map((a) => (
                <button key={a.key} type="button" onClick={a.remove} aria-label={'Bỏ lọc ' + a.label}>
                  {a.label}<Icon name="close" size={14} sw={2.4} />
                </button>
              ))}
            </div>
          )}

          {status !== 'ready' ? <LoadState status={status} /> : visible.map((j) => {
            const g = groups[j.group] || { label: j.group, ink: '#3E4450', soft: '#F1F4F9' };
            return (
              <article key={j.id} className="jl-card" style={{ '--ink-c': g.ink, '--soft': g.soft }}>
                <span className="jl-card__icon"><Icon name={GROUP_ICONS[j.group] || 'briefcase'} size={26} /></span>
                <div className="jl-card__main">
                  <div className="jl-card__badges">
                    <span className="jl-card__group">{g.label}</span>
                    {j.hot && <span className="pill pill--hot-soft">HOT</span>}
                    {hydrated && isUrgent(j.deadline) && <span className="pill pill--urgent">Sắp hết hạn</span>}
                  </div>
                  <h3><Link to={jobPath(j.id)}>{j.title}</Link></h3>
                  <p>{j.desc}</p>
                  <ul className="jl-card__meta">
                    <li>
                      <button type="button" className="jl-card__tag" onClick={() => filterBy({ levels: [j.level] })} title={'Lọc cấp bậc ' + j.level}>
                        <Icon name="level" size={14} />{j.level}
                      </button>
                    </li>
                    {placesOf(j).map((p) => (
                      <li key={p}>
                        <button type="button" className="jl-card__tag" onClick={() => filterBy({ loc: p })} title={'Lọc địa điểm ' + placeLabel(p)}>
                          <Icon name="pin" size={14} />{p}
                        </button>
                      </li>
                    ))}
                    <li><span className="jl-card__tag"><Icon name="clock" size={14} />Hạn: {j.deadline}</span></li>
                  </ul>
                </div>
                <div className="jl-card__actions">
                  <Link className="btn btn--primary" to={jobPath(j.id) + '#nguoi-phu-trach'}>Ứng tuyển</Link>
                  <Link className="btn jl-card__more" to={jobPath(j.id)}>Xem chi tiết</Link>
                </div>
              </article>
            );
          })}

          {status === 'ready' && list.length === 0 && (
            <div className="jl-empty">
              <span className="jl-empty__icon"><Icon name="search-minus" size={30} /></span>
              <strong>Chưa có vị trí khớp với bộ lọc này</strong>
              <span>Thử bỏ bớt bộ lọc, hoặc gửi CV để mình liên hệ khi có vị trí phù hợp.</span>
              <div className="jl-empty__actions">
                <button type="button" className="btn btn--outline" onClick={clearAll}>Xóa bộ lọc</button>
                <a className="btn btn--primary" href="#lien-he">Gửi CV cho mình</a>
              </div>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="jl-pager" aria-label="Phân trang">
              <button type="button" className="jl-pager__btn" onClick={() => goTo(cur - 1)} disabled={cur <= 1} aria-label="Trang trước"><Icon name="chevron-left" size={18} sw={2.2} /></button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" className="jl-pager__btn" aria-current={n === cur ? 'page' : undefined} onClick={() => goTo(n)}>{n}</button>
              ))}
              <button type="button" className="jl-pager__btn" onClick={() => goTo(cur + 1)} disabled={cur >= pageCount} aria-label="Trang sau"><Icon name="chevron-right" size={18} sw={2.2} /></button>
            </nav>
          )}
        </main>
      </div>

      <footer className="site-footer" id="lien-he">
        <div className="container container--wide jl-footer">
          <div className="jl-footer__main">
            <h2>FPT Smart Cloud đang chào đón bạn, hãy liên hệ với mình nhé!</h2>
            <a className="btn btn--white btn--lg" href={'mailto:' + CONTACT.email}><Icon name="mail" size={18} />Gửi CV qua email</a>
          </div>
          <div className="footer-bottom jl-footer__bottom">
            <span>Vũ San · Talent Acquisition Business Partner tại FPT Smart Cloud</span>
            <Link to="/">Về trang chủ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
