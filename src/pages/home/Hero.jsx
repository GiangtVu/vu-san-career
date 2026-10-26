import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { CONTACT, jobPath } from '../../lib/jobs.jsx';

const SUGGESTIONS = ['Python', 'Golang', 'ReactJS', 'Data', 'DevOps'];

function RecruiterCard() {
  return (
    <div className="recruiter-card">
      <div className="recruiter-card__head">
        <div className="recruiter-card__who">
          <strong>Vũ San</strong>
          <span>Talent Acquisition Business Partner · FPT Smart Cloud</span>
        </div>
        <span className="status-pill"><span className="status-pill__dot" aria-hidden="true"></span>Đang nhận CV</span>
      </div>
      <p>Chào bạn! Có câu hỏi về vị trí nào, cứ nhắn mình nhé.</p>
      <div className="social">
        <a className="icon-btn" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo"><Icon name="chat" /></a>
        <a className="icon-btn" href={'mailto:' + CONTACT.email} aria-label="Email"><Icon name="mail" /></a>
        <a className="icon-btn" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon name="link" /></a>
        <a className="icon-btn" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="people" /></a>
      </div>
    </div>
  );
}

export function HeroDesktop({ total, groupCount, role, roleOut, q, onSearch, onSuggest }) {
  return (
    <section className="hero u-desktop">
      <div className="container hero__inner">
        <div className="hero__text">
          <span className="pill-badge reveal">
            <span className="diamond" aria-hidden="true"></span>
            Đang tuyển{total > 0 ? ' · ' + total + ' vị trí' : ''}
          </span>
          <h1 className="hero__title reveal" style={{ '--d': '80ms' }}>Ứng tuyển cùng <span className="accent">người đồng hành</span></h1>
          <p className="hero__seeking reveal" style={{ '--d': '160ms' }}>
            Chúng mình đang tìm
            {role && <span className={'role-pill' + (roleOut ? ' is-out' : '')} aria-live="off">{role}</span>}
          </p>
          <p className="hero__lead reveal" style={{ '--d': '240ms' }}>
            FPT Smart Cloud đang tuyển Fullstack, AI &amp; Data, Business Analyst, Product Owner, Project Manager và DevOps. Gửi CV trực tiếp cho mình để cùng trao đổi về vị trí phù hợp.
          </p>
          <div className="search-block reveal" style={{ '--d': '320ms' }}>
            <label htmlFor="job-search">Bạn đang tìm vị trí nào?</label>
            <div className="searchbar">
              <div className="searchbar__field">
                <Icon name="search" />
                <input
                  id="job-search"
                  type="search"
                  value={q}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Tên vị trí hoặc kỹ năng, ví dụ: Python"
                  autoComplete="off"
                />
              </div>
              <a className="btn btn--primary btn--lg" href="#viec-lam">Xem vị trí</a>
            </div>
            <div className="suggest">
              <span className="suggest__label">Gợi ý:</span>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip-btn" onClick={() => onSuggest(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="hero-stats reveal" style={{ '--d': '400ms' }}>
            <div className="hero-stat"><strong>{total}</strong><span>vị trí đang mở</span></div>
            <div className="hero-stat"><strong>{groupCount}</strong><span>nhóm chuyên môn</span></div>
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
            <img src="/img/hero-portrait.jpg" alt="Vũ San, phụ trách tuyển dụng tại FPT Smart Cloud" width="460" height="575" />
          </figure>
          <RecruiterCard />
        </div>
      </div>
    </section>
  );
}

export function HeroMobile({ total, hotJobs, role, roleOut, q, onSearch }) {
  return (
    <section className="mhero u-mobile">
      <div className="mhero__top">
        <div className="mhero__img">
          <img src="/img/hero-mobile.jpg" alt="Vũ San, phụ trách tuyển dụng tại FPT Smart Cloud" width="390" height="320" />
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
              <span>Talent Acquisition Business Partner · Đang nhận CV</span>
            </span>
          </span>
          <a className="round-btn" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" aria-label="Nhắn Zalo"><Icon name="chat" /></a>
        </div>

        <div className="mhero__spacer" aria-hidden="true"></div>

        <div className="mhero__headline reveal" style={{ '--d': '120ms' }}>
          <h1 aria-label={total + ' vị trí công nghệ đang chờ bạn'}>
            <span className="mhero__big" aria-hidden="true">{total}</span>
            <span className="mhero__small" aria-hidden="true">vị trí công nghệ<br />đang chờ bạn</span>
          </h1>
          <p className="mhero__seeking">
            Chúng mình đang tìm
            {role && <span className={'role-underline' + (roleOut ? ' is-out' : '')} aria-live="off">{role}</span>}
          </p>
        </div>

        <div className="reveal" style={{ '--d': '240ms' }}>
          <label htmlFor="job-search-m" className="sr-only">Tìm vị trí</label>
          <div className="msearch">
            <Icon name="search" />
            <input
              id="job-search-m"
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Vị trí, kỹ năng…"
              autoComplete="off"
            />
            <a className="msearch__go" href="#viec-lam" aria-label="Xem vị trí"><Icon name="arrow-right" /></a>
          </div>
        </div>
      </div>
      <div className="mhero__curve" aria-hidden="true">
        <svg viewBox="0 0 390 30" preserveAspectRatio="none"><path d="M0 30 L0 28 C 110 2, 280 2, 390 28 L390 30 Z" fill="#F7F9FE" /></svg>
      </div>

      <div className="hotjobs reveal" style={{ '--d': '360ms' }} id="hot-jobs">
        <div className="hotjobs__head">
          <span className="hot-label"><Icon name="flame" size={14} />HOT JOB</span>
          <Link to="/viec-lam">Xem tất cả {total} vị trí</Link>
        </div>
        {hotJobs.length > 0 && (
          <div className="hotjobs__list">
            {hotJobs.map((j) => (
              <Link key={j.id} className="hotjob" to={jobPath(j.id)} aria-label={'Xem vị trí ' + j.title}>
                <span className="hotjob__text">
                  <strong>{j.title}</strong>
                  <span>{j.level} · Lương {j.salary.toLowerCase()} · Hạn: {j.deadline}</span>
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
