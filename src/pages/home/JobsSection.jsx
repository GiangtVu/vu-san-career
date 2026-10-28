import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { useMediaQuery } from '../../lib/hooks.js';
import { hotFirst, jobPath, LoadState, locationText, matches, norm, skillPath } from '../../lib/jobs.jsx';
import { useLang } from '../../lib/lang.jsx';

const PREVIEW = 6; // jobs shown on the home page; the rest live on /viec-lam
const GROUP_ICONS = { eng: 'code', ai: 'database', biz: 'briefcase', ops: 'infinity' };
// The home page paints these two groups in brighter inks than the list and detail pages do.
const HOME_INK = { ai: '#7C3AED', ops: '#C2410C' };
const groupColors = (k, g) => ({ '--soft': g.soft, '--ink-c': HOME_INK[k] || g.ink });

function JobCard({ job, group }) {
  const { L, lang } = useLang();
  return (
    <article className="job-card u-desktop">
      <div className="job-card__head">
        <span className="job-card__badges">
          <span className="pill pill--group" style={groupColors(job.group, group)}>{group.label}</span>
          {job.hot && <span className="pill pill--hot"><Icon name="flame" size={12} />HOT</span>}
        </span>
        <span className="job-card__deadline">{L('Hạn: ', 'Apply by ')}{job.deadline}</span>
      </div>
      <h3><Link to={jobPath(job.id)}>{job.title}</Link></h3>
      <p className="job-card__desc">{job.desc}</p>
      {job.stack.length > 0 && (
        <div className="job-card__stack">
          {job.stack.map((t) => <Link key={t} to={skillPath(t)} title={L('Tìm việc làm cần ', 'Find jobs that need ') + t}>{t}</Link>)}
        </div>
      )}
      <div className="job-card__meta">
        <span><Icon name="bars" size={16} />{job.level}</span>
        <span><Icon name="pin" size={16} />{locationText(job.location, lang)}</span>
        <span><Icon name="wallet" size={16} />{job.salary}</span>
      </div>
      <a className="btn btn--soft" href="#lien-he" aria-label={L('Ứng tuyển vị trí ', 'Apply for ') + job.title}>{L('Ứng tuyển', 'Apply')}</a>
    </article>
  );
}

function JobMini({ job }) {
  const { L } = useLang();
  return (
    <Link className="job-mini u-mobile" to={jobPath(job.id)} aria-label={L('Xem vị trí ', 'View ') + job.title}>
      <span className="job-mini__top">
        <span className="job-mini__icon"><Icon name={GROUP_ICONS[job.group] || 'briefcase'} size={18} /></span>
        {job.hot
          ? <span className="pill pill--hot"><Icon name="flame" size={11} />HOT</span>
          : <Icon name="arrow-up-right" size={18} />}
      </span>
      <strong className="job-mini__title">{job.title}</strong>
      <span className="job-mini__info">
        <span className="job-mini__salary">{job.salary}</span>
        <span><Icon name="bars" size={13} />{job.level}</span>
        <span><Icon name="calendar" size={13} />{L('Hạn: ', 'Apply by ')}{job.deadline}</span>
      </span>
    </Link>
  );
}

export default function JobsSection({ jobs, groups, status, q, group, setGroup, clear, listUrl }) {
  const { L, roles } = useLang();
  const isMobile = useMediaQuery('(max-width: 719.98px)');
  const nq = norm(q.trim());
  const list = jobs.filter((j) => (!group || j.group === group) && matches(j, nq));
  const shown = hotFirst(list).slice(0, PREVIEW);
  const countOf = (k) => jobs.filter((j) => j.group === k).length;
  const keys = Object.keys(groups);

  const filterParts = [];
  if (group && !isMobile && groups[group]) filterParts.push(groups[group].label);
  if (q.trim()) filterParts.push('“' + q.trim() + '”');

  return (
    <section className="section jobs-section" id="viec-lam">
      <span className="deco deco--jobs" aria-hidden="true"></span>
      <div className="container section__inner">
        <div className="jobs-head">
          <div className="sec-head">
            <span className="sec-num" aria-hidden="true">02</span>
            <span className="eyebrow">{L('Việc làm', 'Jobs')}</span>
            <h2 className="sec-title">{L('Chọn nhóm chuyên môn của bạn', 'Find your team')}</h2>
          </div>
          {status === 'ready' && (
            <p className="jobs-head__result" aria-live="polite">{L('Hiển thị ', 'Showing ')}{shown.length} / {roles(list.length)}</p>
          )}
        </div>

        {status !== 'ready' ? <LoadState status={status} /> : (
          <>
            <div className="cat-grid u-lg">
              {keys.map((k) => {
                const g = groups[k];
                const sel = group === k;
                return (
                  <button
                    key={k}
                    type="button"
                    className="cat-card"
                    style={groupColors(k, g)}
                    aria-pressed={sel}
                    onClick={() => setGroup(sel ? null : k)}
                  >
                    <span className="cat-card__top">
                      <span className="cat-card__icon"><Icon name={GROUP_ICONS[k] || 'briefcase'} size={22} /></span>
                      <span className="cat-card__count">{roles(countOf(k))}</span>
                    </span>
                    <span className="cat-card__name">{g.label}</span>
                    {g.roles && <span className="cat-card__roles">{g.roles}</span>}
                  </button>
                );
              })}
            </div>

            <div className="chip-row u-below-lg" role="group" aria-label={L('Lọc theo nhóm', 'Filter by team')}>
              {[null, ...keys].map((k) => (
                <button
                  key={k || 'all'}
                  type="button"
                  className="filter-chip"
                  aria-pressed={k === null ? !group : group === k}
                  onClick={() => setGroup(k)}
                >
                  {k === null ? L('Tất cả', 'All') : groups[k].label}
                  <span className="filter-chip__n">{k === null ? jobs.length : countOf(k)}</span>
                </button>
              ))}
            </div>

            {filterParts.length > 0 && (
              <div className="filter-row">
                <span className="filter-row__label">{L('Đang lọc:', 'Showing:')}</span>
                <span className="filter-row__value">{filterParts.join(' · ')}</span>
                <button type="button" className="link-btn" onClick={clear}>{L('Bỏ lọc', 'Clear')}</button>
              </div>
            )}

            <div className="job-grid">
              {shown.map((j) => (
                <div key={j.id} className="job-cell">
                  <JobCard job={j} group={groups[j.group] || { label: j.group, soft: '#F1F4F9', ink: '#3E4450' }} />
                  <JobMini job={j} />
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="empty">
                <strong>{L('Chưa có vị trí khớp với từ khóa này', 'No roles match that search just yet')}</strong>
                <span>{L('Thử từ khóa khác, hoặc gửi CV để mình liên hệ khi có vị trí phù hợp.', 'Try a different keyword, or send me your CV and I’ll reach out as soon as something fits.')}</span>
                <a className="btn btn--primary" href="#lien-he">{L('Gửi CV cho mình', 'Send me your CV')}</a>
              </div>
            )}

            {list.length > PREVIEW && (
              <div className="see-all">
                <Link className="btn btn--outline see-all__btn" to={listUrl}>
                  {L('Xem tất cả ', 'See all ') + roles(list.length)}<Icon name="arrow-right" size={18} sw={2.2} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
