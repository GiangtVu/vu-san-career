import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { CONTACT, jobPath } from '../../lib/jobs.jsx';
import { useLang } from '../../lib/lang.jsx';

// Submitting a hero search opens the job list with the same keyword and group.
function useOpenList(listUrl) {
  const navigate = useNavigate();
  return (e) => {
    e.preventDefault();
    navigate(listUrl);
  };
}

const SUGGESTIONS = ['Python', 'Golang', 'ReactJS', 'Data', 'DevOps'];

function RecruiterCard() {
  const { L } = useLang();
  return (
    <div className="recruiter-card">
      <div className="recruiter-card__head">
        <div className="recruiter-card__who">
          <strong>Vũ San</strong>
          <span>Talent Acquisition Business Partner · FPT Smart Cloud</span>
        </div>
        <span className="status-pill"><span className="status-pill__dot" aria-hidden="true"></span>{L('Đang nhận CV', 'Accepting applications')}</span>
      </div>
      <p>{L('Chào bạn! Có câu hỏi về vị trí nào, cứ nhắn mình nhé.', 'Hi there! Have a question about a role? Just drop me a message.')}</p>
      <div className="social">
        <a className="icon-btn" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo"><Icon name="chat" /></a>
        <a className="icon-btn" href={'mailto:' + CONTACT.email} aria-label="Email"><Icon name="mail" /></a>
        <a className="icon-btn" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon name="link" /></a>
        <a className="icon-btn" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="people" /></a>
      </div>
    </div>
  );
}

// `role` is the rotating { label, url } shown after "Chúng mình đang tìm".
export function HeroDesktop({ total, groupCount, role, roleOut, q, onSearch, onSuggest, listUrl }) {
  const { L, roles } = useLang();
  const openList = useOpenList(listUrl);
  return (
    <section className="hero u-desktop">
      <div className="container hero__inner">
        <div className="hero__text">
          <Link className="pill-badge pill-badge--link reveal" to="/viec-lam">
            <span className="diamond" aria-hidden="true"></span>
            {L('Đang tuyển', 'Hiring')}{total > 0 ? ' · ' + roles(total) : ''}
          </Link>
          <h1 className="hero__title reveal" style={{ '--d': '80ms' }}>{L('Ứng tuyển cùng', 'Apply with')} <span className="accent">{L('người đồng hành', 'someone in your corner')}</span></h1>
          <p className="hero__seeking reveal" style={{ '--d': '160ms' }}>
            {L('Chúng mình đang tìm', 'Currently hiring:')}
            {role && <Link className={'role-pill' + (roleOut ? ' is-out' : '')} to={role.url} aria-live="off">{role.label}</Link>}
          </p>
          <p className="hero__lead reveal" style={{ '--d': '240ms' }}>
            {L('FPT Smart Cloud đang tuyển Fullstack, AI & Data, Business Analyst, Product Owner, Project Manager và DevOps. Gửi CV trực tiếp cho mình để cùng trao đổi về vị trí phù hợp.',
              'FPT Smart Cloud is hiring across Fullstack, AI & Data, Business Analysis, Product, Project Management and DevOps. Send your CV straight to me, and we’ll find the role that suits you best.')}
          </p>
          <div className="search-block reveal" style={{ '--d': '320ms' }}>
            <label htmlFor="job-search">{L('Bạn đang tìm vị trí nào?', 'What kind of role interests you?')}</label>
            <form className="searchbar" role="search" onSubmit={openList}>
              <div className="searchbar__field">
                <Icon name="search" />
                <input
                  id="job-search"
                  type="search"
                  value={q}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder={L('Tên vị trí hoặc kỹ năng, ví dụ: Python', 'Job title or skill, e.g. Python')}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn btn--primary btn--lg">{L('Xem vị trí', 'See roles')}</button>
            </form>
            <div className="suggest">
              <span className="suggest__label">{L('Gợi ý:', 'Try:')}</span>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip-btn" onClick={() => onSuggest(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="hero-stats reveal" style={{ '--d': '400ms' }}>
            <div className="hero-stat"><strong>{total}</strong><span>{L('vị trí đang mở', 'open roles')}</span></div>
            <div className="hero-stat"><strong>{groupCount}</strong><span>{L('nhóm chuyên môn', 'teams')}</span></div>
          </div>
        </div>

        <div className="hero__media reveal reveal--far" style={{ '--d': '200ms' }}>
          <div className="hero__pattern" aria-hidden="true">
            <svg width="100%" height="100%" aria-hidden="true">
              <defs>
                <pattern id="tc-hero" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M24 4L44 24L24 44L4 24Z" fill="none" stroke="#1668DC" strokeWidth="1.5" opacity="0.4" />
                  <path d="M24 16L32 24L24 32L16 24Z" fill="#1668DC" opacity="0.85" />
                  <path d="M24 21.5L26.5 24L24 26.5L21.5 24Z" fill="#E7F0FE" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tc-hero)" />
            </svg>
          </div>
          <figure className="hero__photo">
            <img src="/img/hero-portrait.jpg" alt={L('Vũ San, phụ trách tuyển dụng tại FPT Smart Cloud', 'Vũ San, recruiter at FPT Smart Cloud')} width="460" height="575" />
          </figure>
          <RecruiterCard />
        </div>
      </div>
    </section>
  );
}

// `total` counts up on entry; `count` is the settled number for the "see all" link.
export function HeroMobile({ total, count, hotJobs, role, roleOut, q, onSearch, listUrl }) {
  const { L, roles, salaryText } = useLang();
  const openList = useOpenList(listUrl);
  return (
    <section className="mhero u-mobile">
      <div className="mhero__top">
        <div className="mhero__img">
          <img src="/img/hero-mobile.jpg" alt={L('Vũ San, phụ trách tuyển dụng tại FPT Smart Cloud', 'Vũ San, recruiter at FPT Smart Cloud')} width="390" height="320" />
        </div>
        <span className="mhero__fade" aria-hidden="true"></span>
        <svg className="mhero__pattern" aria-hidden="true" width="200" height="150">
          <defs>
            <pattern id="tc-mb" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 4L36 20L20 36L4 20Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M20 14L26 20L20 26L14 20Z" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect width="200" height="150" fill="url(#tc-mb)" />
        </svg>
        {hotJobs.length > 0 && (
          <a className="hot-badge reveal reveal--x" style={{ '--d': '500ms' }} href="#hot-jobs">
            <span><Icon name="flame" size={12} />{hotJobs.length} HOT job</span>
          </a>
        )}

        <div className="mhero__row reveal">
          <span className="mini-profile">
            <span className="mini-profile__dot" aria-hidden="true"></span>
            <span className="mini-profile__text">
              <strong>Vũ San</strong>
              <span>Talent Acquisition Business Partner · {L('Đang nhận CV', 'Accepting applications')}</span>
            </span>
          </span>
          <a className="round-btn" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" aria-label={L('Nhắn Zalo', 'Message on Zalo')}><Icon name="chat" /></a>
        </div>

        <div className="mhero__spacer" aria-hidden="true"></div>

        <div className="mhero__headline reveal" style={{ '--d': '120ms' }}>
          <h1 aria-label={total + ' ' + L('vị trí công nghệ đang chờ bạn', 'tech roles open for you')}>
            <span className="mhero__big" aria-hidden="true">{total}</span>
            <span className="mhero__small" aria-hidden="true">{L('vị trí công nghệ', 'tech roles')}<br />{L('đang chờ bạn', 'open for you')}</span>
          </h1>
          <p className="mhero__seeking">
            {L('Chúng mình đang tìm', 'Currently hiring:')}
            {role && <Link className={'role-underline' + (roleOut ? ' is-out' : '')} to={role.url} aria-live="off">{role.label}</Link>}
          </p>
        </div>

        <div className="reveal" style={{ '--d': '240ms' }}>
          <label htmlFor="job-search-m" className="sr-only">{L('Tìm vị trí', 'Search roles')}</label>
          <form className="msearch" role="search" onSubmit={openList}>
            <Icon name="search" />
            <input
              id="job-search-m"
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={L('Vị trí, kỹ năng…', 'Role, skill…')}
              autoComplete="off"
            />
            <button type="submit" className="msearch__go" aria-label={L('Xem vị trí', 'See roles')}><Icon name="arrow-right" /></button>
          </form>
        </div>
      </div>
      <div className="mhero__curve" aria-hidden="true">
        <svg viewBox="0 0 390 30" preserveAspectRatio="none"><path d="M0 30 L0 28 C 110 2, 280 2, 390 28 L390 30 Z" fill="#F7F9FE" /></svg>
      </div>

      <div className="hotjobs reveal" style={{ '--d': '360ms' }} id="hot-jobs">
        <div className="hotjobs__head">
          <span className="hot-label"><Icon name="flame" size={14} />HOT JOB</span>
          <Link to="/viec-lam">{L('Xem tất cả ', 'See all ') + roles(count)}</Link>
        </div>
        {hotJobs.length > 0 && (
          <div className="hotjobs__list">
            {hotJobs.map((j) => (
              <Link key={j.id} className="hotjob" to={jobPath(j.id)} aria-label={L('Xem vị trí ', 'View ') + j.title}>
                <span className="hotjob__text">
                  <strong>{j.title}</strong>
                  <span>{j.level} · {salaryText(j.salary)} · {L('Hạn: ', 'Apply by ')}{j.deadline}</span>
                </span>
                <span className="hotjob__go"><Icon name="arrow-up-right" size={16} sw={2.2} /></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
