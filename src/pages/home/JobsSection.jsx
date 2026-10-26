import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { useMediaQuery } from '../../lib/hooks.js';
import { hotFirst, jobPath, LoadState, matches, norm } from '../../lib/jobs.jsx';

const PREVIEW = 6; // jobs shown on the home page; the rest live on /viec-lam
const GROUP_ICONS = { eng: 'code', ai: 'database', biz: 'briefcase', ops: 'infinity' };

function JobCard({ job, group }) {
  return (
    <article className="job-card u-desktop">
      <div className="job-card__head">
        <span className="job-card__badges">
          <span className="pill pill--group" style={{ '--soft': group.soft, '--ink-c': group.ink }}>{group.label}</span>
          {job.hot && <span className="pill pill--hot"><Icon name="flame" size={12} />HOT</span>}
        </span>
        <span className="job-card__deadline">Hạn: {job.deadline}</span>
      </div>
      <h3><Link to={jobPath(job.id)}>{job.title}</Link></h3>
      <p className="job-card__desc">{job.desc}</p>
      {job.stack.length > 0 && (
        <div className="job-card__stack">{job.stack.map((t) => <span key={t}>{t}</span>)}</div>
      )}
      <div className="job-card__meta">
        <span><Icon name="bars" size={16} />{job.level}</span>
        <span><Icon name="pin" size={16} />{job.location}</span>
        <span><Icon name="wallet" size={16} />{job.salary}</span>
      </div>
      <a className="btn btn--soft" href="#lien-he" aria-label={'Ứng tuyển vị trí ' + job.title}>Ứng tuyển</a>
    </article>
  );
}

function JobMini({ job }) {
  return (
    <Link className="job-mini u-mobile" to={jobPath(job.id)} aria-label={'Xem vị trí ' + job.title}>
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
        <span><Icon name="calendar" size={13} />Hạn: {job.deadline}</span>
      </span>
    </Link>
  );
}

export default function JobsSection({ jobs, groups, status, q, group, setGroup, clear }) {
  const isMobile = useMediaQuery('(max-width: 719.98px)');
  const nq = norm(q.trim());
  const list = jobs.filter((j) => (!group || j.group === group) && matches(j, nq));
  const shown = hotFirst(list).slice(0, PREVIEW);
  const countOf = (k) => jobs.filter((j) => j.group === k).length;
  const keys = Object.keys(groups);

  const filterParts = [];
  if (group && !isMobile && groups[group]) filterParts.push(groups[group].label);
  if (q.trim()) filterParts.push('“' + q.trim() + '”');

  const moreParams = new URLSearchParams();
  if (q.trim()) moreParams.set('q', q.trim());
  if (group) moreParams.set('group', group);
  const moreQuery = moreParams.toString();

  return (
    <section className="section jobs-section" id="viec-lam">
      <span className="deco deco--jobs" aria-hidden="true"></span>
      <div className="container section__inner">
        <div className="jobs-head">
          <div className="sec-head">
            <span className="sec-num" aria-hidden="true">02</span>
            <span className="eyebrow">Việc làm</span>
            <h2 className="sec-title">Chọn nhóm chuyên môn của bạn</h2>
          </div>
          {status === 'ready' && (
            <p className="jobs-head__result" aria-live="polite">Hiển thị {shown.length} / {list.length} vị trí</p>
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
                    style={{ '--soft': g.soft, '--ink-c': g.ink }}
                    aria-pressed={sel}
                    onClick={() => setGroup(sel ? null : k)}
                  >
                    <span className="cat-card__top">
                      <span className="cat-card__icon"><Icon name={GROUP_ICONS[k] || 'briefcase'} size={22} /></span>
                      <span className="cat-card__count">{countOf(k)} vị trí</span>
                    </span>
                    <span className="cat-card__name">{g.label}</span>
                    {g.roles && <span className="cat-card__roles">{g.roles}</span>}
                  </button>
                );
              })}
            </div>

            <div className="chip-row u-below-lg" role="group" aria-label="Lọc theo nhóm">
              {[null, ...keys].map((k) => (
                <button
                  key={k || 'all'}
                  type="button"
                  className="filter-chip"
                  aria-pressed={k === null ? !group : group === k}
                  onClick={() => setGroup(k)}
                >
                  {k === null ? 'Tất cả' : groups[k].label}
                  <span className="filter-chip__n">{k === null ? jobs.length : countOf(k)}</span>
                </button>
              ))}
            </div>

            {filterParts.length > 0 && (
              <div className="filter-row">
                <span className="filter-row__label">Đang lọc:</span>
                <span className="filter-row__value">{filterParts.join(' · ')}</span>
                <button type="button" className="link-btn" onClick={clear}>Bỏ lọc</button>
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
                <strong>Chưa có vị trí khớp với từ khóa này</strong>
                <span>Thử từ khóa khác, hoặc gửi CV để mình liên hệ khi có vị trí phù hợp.</span>
                <a className="btn btn--primary" href="#lien-he">Gửi CV cho mình</a>
              </div>
            )}

            {list.length > PREVIEW && (
              <div className="see-all">
                <Link className="btn btn--outline see-all__btn" to={'/viec-lam' + (moreQuery ? '?' + moreQuery : '')}>
                  Xem tất cả {list.length} vị trí<Icon name="arrow-right" size={18} sw={2.2} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
