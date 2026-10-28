import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { JobsProvider } from './lib/jobs.jsx';
import { LangProvider } from './lib/lang.jsx';
import { notePath, takeKeepScroll } from './lib/listReturn.js';
import Home from './pages/Home.jsx';
import JobList from './pages/JobList.jsx';
import JobDetail from './pages/JobDetail.jsx';
import NotFound from './pages/NotFound.jsx';

// On navigation: jump to the #hash target when there is one, else to the top (unless the job
// list is restoring where the visitor left it, lib/listReturn.js).
// Content can arrive after the JSON loads, so retry the hash lookup for a moment.
// Not to the top on the first load: the browser has already placed the page (at the top, or
// where it was before a reload), and a prerendered page can be scrolled before React loads.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const handled = useRef(null); // the location last scrolled for
  useEffect(() => {
    const here = pathname + hash;
    // Same location again is StrictMode re-running the effect in development.
    const firstLoad = handled.current === null || handled.current === here;
    handled.current = here;
    notePath(pathname);
    const keep = takeKeepScroll();
    if (!hash) {
      if (!firstLoad && !keep) window.scrollTo(0, 0);
      return undefined;
    }
    let tries = 0;
    let timer = 0;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView();
      else if (tries++ < 20) timer = setTimeout(seek, 50);
    };
    seek();
    return () => clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

export default function App({ initialData }) {
  return (
    <LangProvider>
      <JobsProvider initialData={initialData}>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viec-lam" element={<JobList />} />
          <Route path="/viec-lam/:id" element={<JobDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </JobsProvider>
    </LangProvider>
  );
}
