import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/job.css';
import Icon from '../components/Icon.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import { useHydrated, useMediaQuery } from '../lib/hooks.js';
import { useLang } from '../lib/lang.jsx';
import { CONTACT, hotFirst, jobPath, LoadState, locationText, placeLabel, placesOf, skillPath, skillsOf, useJobs } from '../lib/jobs.jsx';
import { jobTitle, SITE_NAME } from '../lib/seo.js';

const SAVED_KEY = 'vs-saved-jobs';

// [vi, en]
const BENEFITS = [
  ['Lương cạnh tranh theo năng lực, thỏa thuận khi phỏng vấn', 'Competitive pay that reflects your skills, agreed during the interview'],
  ['Bảo hiểm xã hội, y tế theo Luật Lao động', 'Social and health insurance as required by Vietnamese labor law'],
  ['Gói chăm sóc sức khỏe FPT Premium Care', 'FPT Premium Care health package'],
  ['Môi trường sáng tạo, cởi mở, tôn trọng cá nhân', 'A creative, open workplace where every individual is respected'],
  ['Tài trợ khóa học và chứng chỉ liên quan', 'Sponsored courses and certifications related to your work'],
  ['Hoạt động văn hóa cùng FCI và Tập đoàn FPT, hỗ trợ học tập cho con CBNV', 'Team and culture activities with FCI and FPT Corporation, plus study support for employees’ children']
];

function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch (e) { return []; }
}

function useSavedJob(id) {
  // The prerendered page can't know what this browser saved; read it once hydrated.
  const hydrated = useHydrated();
  const [saved, setSaved] = useState(() => hydrated && readSaved().includes(id));
  useEffect(() => { setSaved(readSaved().includes(id)); }, [id]);
  const toggle = () => {
    const list = readSaved().filter((x) => x !== id);
    if (!saved) list.push(id);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
    setSaved(!saved);
  };
  return [saved, toggle];
}

// Up to three other jobs: the job's own `related` list first, then same group, then HOT ones.
function relatedJobs(job, jobs) {
  const picked = [];
  const add = (j) => { if (j && j.id !== job.id && !picked.includes(j) && picked.length < 3) picked.push(j); };
  ((job.detail && job.detail.related) || []).forEach((id) => add(jobs.find((j) => j.id === id)));
  jobs.filter((j) => j.group === job.group).forEach(add);
  hotFirst(jobs).forEach(add);
  return picked;
}

// On phones each section collapses into an accordion; one open at a time. Closed bodies stay
// in the page, only hidden, so search engines indexing the phone layout still read them.
// The prerendered HTML is the desktop layout (isPhone false); `jd-sec--phone-closed` hides,
// with CSS on phones, the sections the accordion starts closed, so nothing jumps on hydration.
function Section({ n, title, icon, accordion, children }) {
  const { isPhone, openSec, setOpenSec } = accordion;
  const open = !isPhone || openSec === n;
  const bodyId = 'jd-sec-' + n;
  const label = (
    <>
      {icon && <span className="jd-sec__icon"><Icon name={icon} size={18} /></span>}
      {title}
    </>
  );
  return (
    <section className={'jd-card jd-sec' + (!isPhone && openSec !== n ? ' jd-sec--phone-closed' : '')}>
      <h2>
        {isPhone ? (
          <button
            type="button"
            className="jd-sec__toggle"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpenSec(openSec === n ? null : n)}
          >
            {label}
            <Icon name="chevron-down" sw={2.2} className="jd-sec__chev" />
          </button>
        ) : <span className="jd-sec__toggle">{label}</span>}
      </h2>
      <div className="jd-sec__body" id={bodyId} hidden={!open}>{children}</div>
    </section>
  );
}

export default function JobDetail() {
  const { lang, L, salaryText } = useLang();
  const { id } = useParams();
  const { status, data } = useJobs();
  const isPhone = useMediaQuery('(max-width: 639.98px)');
  const [openSec, setOpenSec] = useState(2);
  const [saved, toggleSave] = useSavedJob(id);

  const job = data ? data.allJobs.find((j) => j.id === id) : null;

  useEffect(() => {
    document.title = job ? jobTitle(job, lang) : SITE_NAME;
  }, [job, lang]);
  useEffect(() => { setOpenSec(2); }, [id]);

  if (!job) {
    return (
      <div className="pg jd-page">
        <SiteHeader navClass="u-not-phone" cvHref="/#lien-he" />
        <div className="container jd-missing">
          {status === 'ready' ? (
            <div className="load-state">
              {L('Vị trí này không còn tuyển hoặc đường dẫn chưa đúng. ', 'This role is no longer open, or the link isn’t right. ')}<Link to="/viec-lam">{L('Xem các vị trí đang tuyển', 'See open roles')}</Link>
            </div>
          ) : <LoadState status={status} />}
        </div>
      </div>
    );
  }

  const group = data.groups[job.group] || { label: job.group };
  const d = job.detail || {};
  const duties = d.duties || [job.desc];
  const skills = skillsOf(job);
  const accordion = { isPhone, openSec, setOpenSec };

  const location = locationText(job.location, lang);
  const closedText = L('Ngừng tuyển từ ', 'Closed on ') + job.closedAt;
  const info = [
    [L('Mức lương', 'Salary'), job.salary, 'jd-info__accent'],
    [L('Cấp bậc', 'Level'), job.level],
    d.experience && [L('Kinh nghiệm', 'Experience'), d.experience],
    d.department && [L('Phòng ban', 'Team'), d.department],
    d.type && [L('Hình thức', 'Job type'), d.type],
    [L('Địa điểm', 'Location'), location],
    job.closed ? [L('Trạng thái', 'Status'), closedText, 'jd-info__deadline'] : [L('Hạn nộp', 'Apply by'), job.deadline, 'jd-info__deadline']
  ].filter(Boolean);

  return (
    <div className="pg jd-page">
      <SiteHeader navClass="u-not-phone" cvHref="#nguoi-phu-trach" />

      <section className="jd-banner">
        <svg className="jd-banner__pattern" aria-hidden="true" width="320" height="240">
          <defs>
            <pattern id="jd-pat" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M22 4L40 22L22 40L4 22Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M22 15L29 22L22 29L15 22Z" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect width="320" height="240" fill="url(#jd-pat)" />
        </svg>
        <div className="container jd-banner__inner">
          <nav className="breadcrumb u-not-phone" aria-label="Breadcrumb">
            <Link to="/">{L('Trang chủ', 'Home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/viec-lam">{L('Việc làm', 'Jobs')}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{job.title}</span>
          </nav>
          <div className="jd-banner__badges">
            <span className="jd-badge">{group.label}{d.department ? ' · ' + d.department : ''}</span>
            {job.hot && <span className="jd-badge jd-badge--hot">HOT</span>}
            {job.closed && <span className="jd-badge jd-badge--closed">{L('Đã ngừng tuyển', 'No longer hiring')}</span>}
          </div>
          <h1>{job.title}</h1>
          <ul className="jd-meta">
            <li><Icon name="wallet" size={18} />{job.salary}</li>
            <li><Icon name="level" size={18} />{job.level}</li>
            <li><Icon name="pin" size={18} />{location}</li>
            <li><Icon name="clock" size={18} />{job.closed ? closedText : L('Hạn nộp: ', 'Apply by ') + job.deadline}</li>
          </ul>
          <div className="jd-actions">
            {job.closed ? (
              <Link className="btn btn--white jd-actions__apply" to="/viec-lam">{L('Xem việc làm đang tuyển', 'See open roles')}<Icon name="arrow-right" size={18} sw={2.2} /></Link>
            ) : (
              <>
                <a className="btn btn--white jd-actions__apply" href="#nguoi-phu-trach">{L('Ứng tuyển ngay', 'Apply now')}<Icon name="arrow-right" size={18} sw={2.2} /></a>
                <button type="button" className="jd-actions__save" aria-pressed={saved} onClick={toggleSave}>
                  <Icon name="bookmark" size={18} fill={saved} />{saved ? L('Đã lưu', 'Saved') : L('Lưu tin', 'Save job')}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container jd-body">
        <main className="jd-main">
          {job.closed && (
            <div className="jd-card jd-closed" role="status">
              {L(`Vị trí này đã ngừng tuyển từ ${job.closedAt}. Thông tin bên dưới được giữ lại để tham khảo, bạn có thể xem các `,
                `This role closed on ${job.closedAt}. The details below are kept for reference. You can browse the `)}
              <Link to="/viec-lam">{L('vị trí đang tuyển', 'open roles')}</Link>
              {L(' hoặc nhắn Vũ San để được giới thiệu vị trí phù hợp.', ' or message Vũ San to hear about a role that fits.')}
            </div>
          )}

          <Section n={1} title={L('Về FPT Smart Cloud', 'About FPT Smart Cloud')} accordion={accordion}>
            <p className="jd-text">{L('FPT Smart Cloud (FCI) là thành viên Tập đoàn FPT, cung cấp giải pháp Trí tuệ nhân tạo và Điện toán đám mây cho doanh nghiệp tại Việt Nam và quốc tế: giải pháp may đo theo nhu cầu, nền tảng all-in-one và công nghệ sẵn sàng cho tương lai.',
              'FPT Smart Cloud (FCI), part of FPT Corporation, builds AI and cloud solutions for businesses in Vietnam and around the world, from tailored solutions to an all-in-one platform and future-ready technology.')}</p>
          </Section>

          <Section n={2} title={L('Mô tả công việc', 'What you’ll do')} icon="list" accordion={accordion}>
            <ul className="jd-list">{duties.map((t) => <li key={t}>{t}</li>)}</ul>
          </Section>

          {(d.requirements || skills.length > 0) && (
            <Section n={3} title={L('Yêu cầu', 'What we’re looking for')} icon="check-circle" accordion={accordion}>
              {(d.requirements || []).map((r) => (
                <div key={r.title} className="jd-req">
                  <h3>{r.title}</h3>
                  <ul className="jd-list">{r.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              ))}
              {skills.length > 0 && (
                <div className="jd-skills">
                  {skills.map((s) => (
                    <Link key={s} className="tag tag--link" to={skillPath(s)} title={L('Tìm việc làm cần ', 'Find jobs that need ') + s}>{s}</Link>
                  ))}
                </div>
              )}
            </Section>
          )}

          <Section n={4} title={L('Phúc lợi', 'What you’ll get')} icon="gift" accordion={accordion}>
            <div className="jd-benefits">
              {BENEFITS.map((b) => (
                <div key={b[0]} className="jd-benefit">
                  <span className="jd-benefit__check"><Icon name="check" size={12} sw={3.2} /></span>{L(...b)}
                </div>
              ))}
            </div>
          </Section>

          <Section n={5} title={L('Môi trường làm việc', 'Where & when you’ll work')} icon="building" accordion={accordion}>
            <div className="jd-env">
              <div className="jd-env__item jd-env__item--wide">
                <span className="jd-env__icon"><Icon name="pin" size={20} /></span>
                <div className="jd-env__body">
                  <h3 className="jd-env__label">{L('Địa điểm', 'Location')}</h3>
                  <ul className="jd-env__places">
                    {placesOf(job).map((p) => (
                      <li key={p}>
                        <strong>{placeLabel(p, lang)}</strong>
                        {data.offices[p] && <span>{data.offices[p]}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="jd-env__item">
                <span className="jd-env__icon"><Icon name="clock" size={20} /></span>
                <div className="jd-env__body">
                  <h3 className="jd-env__label">{L('Giờ làm việc', 'Working hours')}</h3>
                  <dl className="jd-env__hours">
                    <div><dt>{L('Sáng', 'Morning')}</dt><dd>8:30 – 12:00</dd></div>
                    <div><dt>{L('Chiều', 'Afternoon')}</dt><dd>13:00 – 17:30</dd></div>
                  </dl>
                </div>
              </div>
              <div className="jd-env__item">
                <span className="jd-env__icon"><Icon name="calendar" size={20} /></span>
                <div className="jd-env__body">
                  <h3 className="jd-env__label">{L('Ngày làm việc', 'Working days')}</h3>
                  <strong className="jd-env__value">{L('Thứ 2 – Thứ 6', 'Monday – Friday')}</strong>
                  <span className="jd-env__note">{L('Nghỉ thứ 7 và chủ nhật', 'Weekends off')}</span>
                </div>
              </div>
            </div>
          </Section>
        </main>

        <aside className="jd-side">
          <section className="jd-card jd-card--raised jd-side__card">
            <h2>{L('Thông tin chung', 'At a glance')}</h2>
            <dl className="jd-info">
              {info.map(([label, value, cls]) => (
                <div key={label}><dt>{label}</dt><dd className={cls}>{value}</dd></div>
              ))}
            </dl>
            {job.closed
              ? <Link className="btn btn--primary jd-side__apply" to="/viec-lam">{L('Xem việc làm đang tuyển', 'See open roles')}</Link>
              : <a className="btn btn--primary jd-side__apply" href="#nguoi-phu-trach">{L('Ứng tuyển ngay', 'Apply now')}</a>}
          </section>

          <section className="jd-card jd-side__card jd-contact" id="nguoi-phu-trach">
            <h2>{L('Người phụ trách', 'Your recruiter')}</h2>
            <div className="jd-contact__who">
              <span className="jd-contact__avatar" aria-hidden="true">VS</span>
              <span>
                <strong>Vũ San</strong>
                <span>Talent Acquisition Business Partner · FPT Smart Cloud</span>
              </span>
            </div>
            <p>{L('Có câu hỏi về vị trí này? Nhắn trực tiếp cho mình qua Zalo hoặc Email.', 'Have a question about this role? Feel free to message me on Zalo or by email.')}</p>
            <div className="jd-contact__links">
              <a href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} />Zalo</a>
              <a href={'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(L('Ứng tuyển ', 'Application: ') + job.title)}><Icon name="mail" size={16} />Email</a>
            </div>
          </section>

          <section className="jd-card jd-card--raised jd-side__card">
            <div className="jd-related__head">
              <h2>{L('Việc làm khác', 'You might also like')}</h2>
              <Link to="/viec-lam">{L('Xem tất cả', 'View all')}<Icon name="arrow-right" size={14} sw={2.2} /></Link>
            </div>
            <div className="jd-related">
              {relatedJobs(job, data.jobs).map((r) => {
                const g = data.groups[r.group] || { label: r.group, soft: '#F1F4F9', ink: '#3E4450' };
                return (
                  <Link key={r.id} to={jobPath(r.id)} className="jd-related__item">
                    <span className="pill pill--group" style={{ '--soft': g.soft, '--ink-c': g.ink }}>{g.label}</span>
                    <strong>{r.title}</strong>
                    <span>{r.level} · {salaryText(r.salary)} · {locationText(r.location, lang)}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <footer className="site-footer">
        <div className="container footer-bottom jd-footer">
          <span>{L('Vũ San · Talent Acquisition Business Partner tại FPT Smart Cloud', 'Vũ San · Talent Acquisition Business Partner at FPT Smart Cloud')}</span>
          <Link to="/">{L('Về trang chủ', 'Back to home')}</Link>
        </div>
      </footer>
    </div>
  );
}
