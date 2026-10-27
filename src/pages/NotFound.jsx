import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/job.css';
import SiteHeader from '../components/SiteHeader.jsx';
import { NOT_FOUND_TITLE } from '../lib/seo.js';

// Shown for unknown URLs, which Vercel serves from 404.html with a real 404 status.
export default function NotFound() {
  useEffect(() => { document.title = NOT_FOUND_TITLE; }, []);
  return (
    <div className="pg jd-page">
      <SiteHeader navClass="u-not-phone" cvHref="/#lien-he" />
      <div className="container jd-missing">
        <div className="load-state">
          Không tìm thấy trang này. <Link to="/viec-lam">Xem các vị trí đang tuyển</Link> hoặc <Link to="/">về trang chủ</Link>.
        </div>
      </div>
    </div>
  );
}
