import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Logo from '../../components/Logo.jsx';
import { LangButton, LangSwitch, SameWidth } from '../../components/LangSwitch.jsx';
import { useLang } from '../../lib/lang.jsx';

const LINKS = [
  { href: '#cong-ty', label: ['Công ty', 'Company'], mobile: ['Về FPT Smart Cloud', 'About FPT Smart Cloud'] },
  { href: '#viec-lam', label: ['Việc làm', 'Jobs'], count: true },
  { href: '#quy-trinh', label: ['Quy trình', 'How we hire'] },
  { href: '#phuc-loi', label: ['Phúc lợi', 'Benefits'] }
];

export default function HomeHeader({ total }) {
  const { L, roles } = useLang();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const navLabel = L('Điều hướng chính', 'Main navigation');
  const cv = <SameWidth vi="Gửi CV" en="Send CV" />;

  return (
    <header className="site-header site-header--sticky">
      <div className="container header-bar home-nav--full">
        <a className="brand" href="#top">
          <Logo size={36} />
          <strong className="brand__name">Vũ San <span>Careers</span></strong>
        </a>
        <nav className="main-nav" aria-label={navLabel}>
          {LINKS.map((l) => <a key={l.href} className="nav-link" href={l.href}>{L(...l.label)}</a>)}
          <span className="nav-sep" aria-hidden="true"></span>
          <Link className="nav-jobs" to="/viec-lam">
            <Icon name="briefcase" size={18} />{L('Tất cả việc làm', 'All jobs')}
            {total > 0 && <span className="nav-jobs__badge">{total}</span>}
          </Link>
          <LangSwitch />
          <a className="btn btn--primary" href="#lien-he">{cv}</a>
        </nav>
      </div>

      <div className="home-nav--compact">
        <div className="mheader">
          <a className="brand" href="#top">
            <Logo size={30} />
            <strong className="brand__name">Vũ San <span>Careers</span></strong>
          </a>
          <LangButton />
          <a className="btn btn--primary" href="#lien-he">{cv}</a>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? L('Đóng menu', 'Close menu') : L('Mở menu', 'Open menu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <span className="menu-toggle__icon menu-toggle__open"><Icon name="menu" size={22} /></span>
            <span className="menu-toggle__icon menu-toggle__close"><Icon name="close" size={22} /></span>
          </button>
        </div>
        {/* Stays in the page so it can slide shut; inert while closed keeps focus out of it. */}
        <div className={'mnav-wrap' + (open ? ' is-open' : '')} inert={open ? undefined : ''}>
          <div className="mnav-wrap__clip">
            <nav className="mnav" id="mobile-menu" aria-label={navLabel}>
              <Link className="nav-jobs nav-jobs--menu" to="/viec-lam" style={{ '--i': 0 }}>
                <Icon name="briefcase" size={20} />
                <span className="nav-jobs__label">{L('Tất cả việc làm', 'All jobs')}</span>
                <Icon name="arrow-right" size={18} sw={2.2} />
              </Link>
              {LINKS.map((l, i) => (
                <a key={l.href} href={l.href} onClick={close} style={{ '--i': i + 1 }}>
                  {L(...(l.mobile || l.label))}
                  {l.count && total > 0 && <span className="mnav__count">{roles(total)}</span>}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
