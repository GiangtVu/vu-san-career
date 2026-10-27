import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { loadJobsData } from './lib/jobs.jsx';
import './styles/site.css';

const container = document.getElementById('root');
const app = (data) => (
  <StrictMode>
    <BrowserRouter>
      <App initialData={data} />
    </BrowserRouter>
  </StrictMode>
);

// Pages prerendered at build time (scripts/prerender.mjs) mark the path they were rendered
// for in data-ssr. Hydrate those once the same jobs data has loaded, so the first render
// matches the HTML. Render everything else from scratch: 404.html, which serves any path,
// and the job list with a search or filter in the query, which the prerender didn't see.
const { pathname, search } = window.location;
const filtered = pathname === '/viec-lam' && /[?&](q|group|skill)=/.test(search);
if (container.dataset.ssr === pathname && !filtered) {
  // If the data can't load, the prerendered page stays as it is: readable, links working.
  loadJobsData().then(
    (data) => hydrateRoot(container, app(data)),
    (err) => console.error('Could not load jobs data; page stays static.', err)
  );
} else {
  createRoot(container).render(app());
}
