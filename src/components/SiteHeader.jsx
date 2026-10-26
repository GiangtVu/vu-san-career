import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';

// Header for the inner pages. `navClass` hides the text links at narrow widths.
export default function SiteHeader({ wide, navClass, cvHref }) {
  return (
    <header className="site-header">
      <div className={'container header-bar' + (wide ? ' container--wide' : '')}>
        <Link className="brand" to="/">
          <Logo size={36} />
          <strong className="brand__name">Vũ San <span>Careers</span></strong>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <Link className={'nav-link ' + navClass} to="/">Trang chủ</Link>
          <NavLink className={'nav-link ' + navClass} to="/viec-lam">Việc làm</NavLink>
          <a className="btn btn--primary" href={cvHref}>Gửi CV</a>
        </nav>
      </div>
    </header>
  );
}
