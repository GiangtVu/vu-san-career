import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { JobsProvider } from './lib/jobs.jsx';
import Home from './pages/Home.jsx';
import JobList from './pages/JobList.jsx';
import JobDetail from './pages/JobDetail.jsx';
import NotFound from './pages/NotFound.jsx';

// On navigation: jump to the #hash target when there is one, else to the top.
// Content can arrive after the JSON loads, so retry the hash lookup for a moment.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
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

export default function App() {
  return (
    <JobsProvider>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/viec-lam" element={<JobList />} />
        <Route path="/viec-lam/:id" element={<JobDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </JobsProvider>
  );
}
