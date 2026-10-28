import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/job.css';
import SiteHeader from '../components/SiteHeader.jsx';
import { NOT_FOUND_TITLE } from '../lib/seo.js';
import { useLang } from '../lib/lang.jsx';

// Shown for unknown URLs, which Vercel serves from 404.html with a real 404 status.
export default function NotFound() {
  const { lang, L } = useLang();
  useEffect(() => { document.title = NOT_FOUND_TITLE[lang]; }, [lang]);
  return (
    <div className="pg jd-page">
      <SiteHeader navClass="u-not-phone" cvHref="/#lien-he" />
      <div className="container jd-missing">
        <div className="load-state">
          {L('Không tìm thấy trang này. ', 'We couldn’t find this page. ')}<Link to="/viec-lam">{L('Xem các vị trí đang tuyển', 'See open roles')}</Link>{L(' hoặc ', ' or ')}<Link to="/">{L('về trang chủ', 'go to the home page')}</Link>.
        </div>
      </div>
    </div>
  );
}
