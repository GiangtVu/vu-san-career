import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/job.css';
import Icon from '../components/Icon.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import { useMediaQuery } from '../lib/hooks.js';
import { CONTACT, hotFirst, jobPath, LoadState, useJobs } from '../lib/jobs.jsx';

const SAVED_KEY = 'vs-saved-jobs';

const BENEFITS = [
  'Lương cạnh tranh theo năng lực, thỏa thuận khi phỏng vấn',
  'Bảo hiểm xã hội, y tế theo Luật Lao động',
  'Gói chăm sóc sức khỏe FPT Premium Care',
  'Môi trường sáng tạo, cởi mở, tôn trọng cá nhân',
  'Tài trợ khóa học và chứng chỉ liên quan',
  'Hoạt động văn hóa cùng FCI và Tập đoàn FPT, hỗ trợ học tập cho con CBNV'
];

function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch (e) { return []; }
}

function useSavedJob(id) {
  const [saved, setSaved] = useState(() => readSaved().includes(id));
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

// On phones each section collapses into an accordion; one open at a time.
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
    <section className="jd-card jd-sec">
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
      {open && <div className="jd-sec__body" id={bodyId}>{children}</div>}
    </section>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { status, data } = useJobs();
  const isPhone = useMediaQuery('(max-width: 639.98px)');
  const [openSec, setOpenSec] = useState(2);
  const [saved, toggleSave] = useSavedJob(id);

  const job = data ? data.jobs.find((j) => j.id === id) : null;

  useEffect(() => {
    document.title = (job ? job.title + ' · ' : '') + 'Vũ San Careers';
  }, [job]);
  useEffect(() => { setOpenSec(2); }, [id]);

  if (!job) {
    return (
      <div className="jd-page">
        <SiteHeader navClass="u-not-phone" cvHref="/#lien-he" />
        <div className="container jd-missing">
          {status === 'ready' ? (
            <div className="load-state">
              Vị trí này không còn tuyển hoặc đường dẫn chưa đúng. <Link to="/viec-lam">Xem các vị trí đang tuyển</Link>
            </div>
          ) : <LoadState status={status} />}
        </div>
      </div>
    );
  }

  const group = data.groups[job.group] || { label: job.group };
  const d = job.detail || {};
  const duties = d.duties || [job.desc];
  const skills = d.skills || job.stack;
  const address = data.offices[job.location] || job.location;
  const accordion = { isPhone, openSec, setOpenSec };

  const info = [
    ['Mức lương', job.salary, 'jd-info__accent'],
    ['Cấp bậc', job.level],
    d.experience && ['Kinh nghiệm', d.experience],
    d.department && ['Phòng ban', d.department],
    d.type && ['Hình thức', d.type],
    ['Địa điểm', job.location],
    ['Hạn nộp', job.deadline, 'jd-info__deadline']
  ].filter(Boolean);

  return (
    <div className="jd-page">
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
            <Link to="/">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <Link to="/viec-lam">Việc làm</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{job.title}</span>
          </nav>
          <div className="jd-banner__badges">
            <span className="jd-badge">{group.label}{d.department ? ' · ' + d.department : ''}</span>
            {job.hot && <span className="jd-badge jd-badge--hot">HOT</span>}
          </div>
          <h1>{job.title}</h1>
          <ul className="jd-meta">
            <li><Icon name="wallet" size={18} />{job.salary}</li>
            <li><Icon name="level" size={18} />{job.level}</li>
            <li><Icon name="pin" size={18} />{job.location}</li>
            <li><Icon name="clock" size={18} />Hạn nộp: {job.deadline}</li>
          </ul>
          <div className="jd-actions">
            <a className="btn btn--white jd-actions__apply" href="#nguoi-phu-trach">Ứng tuyển ngay<Icon name="arrow-right" size={18} sw={2.2} /></a>
            <button type="button" className="jd-actions__save" aria-pressed={saved} onClick={toggleSave}>
              <Icon name="bookmark" size={18} fill={saved} />{saved ? 'Đã lưu' : 'Lưu tin'}
            </button>
          </div>
        </div>
      </section>

      <div className="container jd-body">
        <main className="jd-main">
          <Section n={1} title="Về FPT Smart Cloud" accordion={accordion}>
            <p className="jd-text">FPT Smart Cloud (FCI) là thành viên Tập đoàn FPT, cung cấp giải pháp Trí tuệ nhân tạo và Điện toán đám mây cho doanh nghiệp tại Việt Nam và quốc tế: giải pháp may đo theo nhu cầu, nền tảng all-in-one và công nghệ sẵn sàng cho tương lai.</p>
          </Section>

          <Section n={2} title="Mô tả công việc" icon="list" accordion={accordion}>
            <ul className="jd-list">{duties.map((t) => <li key={t}>{t}</li>)}</ul>
          </Section>

          {(d.requirements || skills.length > 0) && (
            <Section n={3} title="Yêu cầu" icon="check-circle" accordion={accordion}>
              {(d.requirements || []).map((r) => (
                <div key={r.title} className="jd-req">
                  <h3>{r.title}</h3>
                  <ul className="jd-list">{r.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              ))}
              {skills.length > 0 && (
                <div className="jd-skills">{skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
              )}
            </Section>
          )}

          <Section n={4} title="Phúc lợi" icon="gift" accordion={accordion}>
            <div className="jd-benefits">
              {BENEFITS.map((b) => (
                <div key={b} className="jd-benefit">
                  <span className="jd-benefit__check"><Icon name="check" size={12} sw={3.2} /></span>{b}
                </div>
              ))}
            </div>
          </Section>

          <Section n={5} title="Môi trường làm việc" icon="building" accordion={accordion}>
            <dl className="jd-env">
              <div><dt>Địa điểm</dt><dd>{address}</dd></div>
              <div><dt>Giờ làm việc</dt><dd>8:30 – 12:00 và 13:00 – 17:30</dd></div>
              <div><dt>Ngày làm việc</dt><dd>Thứ 2 – Thứ 6, nghỉ cuối tuần</dd></div>
            </dl>
          </Section>
        </main>

        <aside className="jd-side">
          <section className="jd-card jd-card--raised jd-side__card">
            <h2>Thông tin chung</h2>
            <dl className="jd-info">
              {info.map(([label, value, cls]) => (
                <div key={label}><dt>{label}</dt><dd className={cls}>{value}</dd></div>
              ))}
            </dl>
            <a className="btn btn--primary jd-side__apply" href="#nguoi-phu-trach">Ứng tuyển ngay</a>
          </section>

          <section className="jd-card jd-side__card jd-contact" id="nguoi-phu-trach">
            <h2>Người phụ trách</h2>
            <div className="jd-contact__who">
              <span className="jd-contact__avatar" aria-hidden="true">VS</span>
              <span>
                <strong>Vũ San</strong>
                <span>Talent Acquisition Business Partner · FPT Smart Cloud</span>
              </span>
            </div>
            <p>Có câu hỏi về vị trí này? Nhắn trực tiếp cho mình qua Zalo hoặc Email.</p>
            <div className="jd-contact__links">
              <a href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} />Zalo</a>
              <a href={'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Ứng tuyển ' + job.title)}><Icon name="mail" size={16} />Email</a>
            </div>
          </section>

          <section className="jd-card jd-card--raised jd-side__card">
            <div className="jd-related__head">
              <h2>Việc làm khác</h2>
              <Link to="/viec-lam">Xem tất cả<Icon name="arrow-right" size={14} sw={2.2} /></Link>
            </div>
            <div className="jd-related">
              {relatedJobs(job, data.jobs).map((r) => {
                const g = data.groups[r.group] || { label: r.group, soft: '#F1F4F9', ink: '#3E4450' };
                return (
                  <Link key={r.id} to={jobPath(r.id)} className="jd-related__item">
                    <span className="pill pill--group" style={{ '--soft': g.soft, '--ink-c': g.ink }}>{g.label}</span>
                    <strong>{r.title}</strong>
                    <span>{r.level} · Lương {r.salary.toLowerCase()} · {r.location}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <footer className="site-footer">
        <div className="container footer-bottom jd-footer">
          <span>Vũ San · Talent Acquisition Business Partner tại FPT Smart Cloud</span>
          <Link to="/">Về trang chủ</Link>
        </div>
      </footer>
    </div>
  );
}
