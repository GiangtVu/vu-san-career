import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import { LangSwitch, SameWidth } from './LangSwitch.jsx';
import { useLang } from '../lib/lang.jsx';

// Header for the inner pages. `navClass` hides the text links and the language switch at
// narrow widths.
export default function SiteHeader({ wide, navClass, cvHref }) {
  const { L } = useLang();
  return (
    <header className="site-header">
      <div className={'container header-bar' + (wide ? ' container--wide' : '')}>
        <Link className="brand" to="/">
          <Logo size={36} />
          <strong className="brand__name">Vũ San <span>Careers</span></strong>
        </Link>
        <nav className="main-nav" aria-label={L('Điều hướng chính', 'Main navigation')}>
          <Link className={'nav-link ' + navClass} to="/">{L('Trang chủ', 'Home')}</Link>
          <NavLink className={'nav-link ' + navClass} to="/viec-lam">{L('Việc làm', 'Jobs')}</NavLink>
          <LangSwitch className={navClass} />
          <a className="btn btn--primary" href={cvHref}><SameWidth vi="Gửi CV" en="Send CV" /></a>
        </nav>
      </div>
    </header>
  );
}
