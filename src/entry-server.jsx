import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';

// Renders one page to HTML at build time, for scripts/prerender.mjs. Built with
// `vite build --ssr`; main.jsx hydrates the result in the browser.
export function render(url, data) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App initialData={data} />
      </StaticRouter>
    </StrictMode>
  );
}
