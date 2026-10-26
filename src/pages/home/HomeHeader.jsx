import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Logo from '../../components/Logo.jsx';

const LINKS = [
  { href: '#cong-ty', label: 'Công ty', mobile: 'Về FPT Smart Cloud' },
  { href: '#viec-lam', label: 'Việc làm', count: true },
  { href: '#quy-trinh', label: 'Quy trình' },
  { href: '#phuc-loi', label: 'Phúc lợi' }
];

export default function HomeHeader({ total }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header site-header--sticky">
      <div className="container header-bar u-desktop">
        <a className="brand" href="#top">
          <Logo size={36} />
          <strong className="brand__name">Vũ San <span>Careers</span></strong>
        </a>
        <nav className="main-nav" aria-label="Điều hướng chính">
          {LINKS.map((l) => <a key={l.href} className="nav-link" href={l.href}>{l.label}</a>)}
          <span className="nav-sep" aria-hidden="true"></span>
          <Link className="nav-jobs" to="/viec-lam">
            <Icon name="briefcase" size={18} />Tất cả việc làm
            {total > 0 && <span className="nav-jobs__badge">{total}</span>}
          </Link>
          <a className="btn btn--primary" href="#lien-he">Gửi CV</a>
        </nav>
      </div>

      <div className="u-mobile">
        <div className="mheader">
          <a className="brand" href="#top">
            <Logo size={30} />
            <strong className="brand__name">Vũ San <span>Careers</span></strong>
          </a>
          <a className="btn btn--primary" href="#lien-he">Gửi CV</a>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
        {open && (
          <nav className="mnav" id="mobile-menu" aria-label="Điều hướng chính">
            <Link className="nav-jobs nav-jobs--menu" to="/viec-lam">
              <Icon name="briefcase" size={20} />
              <span className="nav-jobs__label">Tất cả việc làm</span>
              <Icon name="arrow-right" size={18} sw={2.2} />
            </Link>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={close}>
                {l.mobile || l.label}
                {l.count && total > 0 && <span className="mnav__count">{total} vị trí</span>}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
