// Render the share artwork without changing the live homepage.
// Usage (Windows, Chrome installed): npm run og:generate
// Font downloads are cached in the OS temp directory. No browser package required.
import { readFile, writeFile, mkdtemp, mkdir, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = await mkdtemp(path.join(tmpdir(), 'vu-san-og-'));
const cache = path.join(tmpdir(), 'vu-san-og-fonts');
await mkdir(cache, { recursive: true });
const fonts = {
  400: 'QdVPSTAyLFyeg_IDWvOJmVES_Eww',
  500: 'QdVMSTAyLFyeg_IDWvOJmVES_HTEJl8y',
  600: 'QdVMSTAyLFyeg_IDWvOJmVES_HToIV8y',
  700: 'QdVMSTAyLFyeg_IDWvOJmVES_HSMIF8y',
};
let fontCss = '';
for (const [weight, name] of Object.entries(fonts)) {
  const dest = path.join(cache, `${weight}.ttf`);
  try { await access(dest); } catch {
    execFileSync('curl.exe', ['--fail', '-sSL', `https://fonts.gstatic.com/s/bevietnampro/v12/${name}.ttf`, '-o', dest], { windowsHide: true });
  }
  const data = (await readFile(dest)).toString('base64');
  fontCss += `@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${data}) format('truetype');}`;
}

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
let markup;
try {
  const { default: OgShare } = await vite.ssrLoadModule('/scripts/og-share.jsx');
  markup = renderToStaticMarkup(React.createElement(OgShare));
} finally {
  await vite.close();
}
const portrait = (await readFile(path.join(root, 'public/img/hero-portrait.jpg'))).toString('base64');
markup = markup.replace('/img/hero-portrait.jpg', `data:image/jpeg;base64,${portrait}`);
const styles = await Promise.all(['src/styles/site.css', 'src/styles/home.css', 'scripts/og-share.css'].map((file) => readFile(path.join(root, file), 'utf8')));
const html = path.join(temp, 'og-share.html');
await writeFile(html, `<!doctype html><html lang="vi"><meta charset="UTF-8"><title>Vũ San Careers — Share preview</title><style>${fontCss}\n${styles.join('\n')}</style><body>${markup}</body></html>`);

const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const png = path.join(temp, 'og-share.png');
execFileSync(chrome, [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630',
  '--virtual-time-budget=2000', `--user-data-dir=${path.join(temp, 'chrome-profile')}`,
  `--screenshot=${png}`, new URL(`file:///${html.replaceAll('\\', '/')}`).href,
], { windowsHide: true, timeout: 60000, stdio: 'pipe' });

// Encode an optimized JPEG while retaining the 1200 × 630 OG dimensions.
const output = path.join(root, 'public/img/og-share.jpg');
const quote = (value) => `'${value.replaceAll("'", "''")}'`;
execFileSync('powershell.exe', ['-NoProfile', '-Command', `
  Add-Type -AssemblyName System.Drawing
  $bitmap = [System.Drawing.Image]::FromFile(${quote(png)})
  try {
    if ($bitmap.Width -ne 1200 -or $bitmap.Height -ne 630) { throw 'Unexpected OG dimensions' }
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]78)
    $bitmap.Save(${quote(output)}, $codec, $parameters)
    $parameters.Dispose()
  } finally { $bitmap.Dispose() }
`], { windowsHide: true, stdio: 'pipe' });
console.log(`Generated ${output} (1200 × 630). Preview source: ${html}`);
