import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// The site language, Vietnamese or English. Pages are prerendered in Vietnamese, so every visit
// starts in Vietnamese (hydration must match the HTML). Once mounted, the visitor's own choice is
// used if they made one, else English for visitors outside Vietnam.
const STORE_KEY = 'vsLang';
const COUNTRY_KEY = 'vsCountry';
const VN_ZONES = ['Asia/Ho_Chi_Minh', 'Asia/Saigon'];

// Without the country lookup (local dev, or the request failed): Vietnam's time zone or a
// Vietnamese browser. Windows in Vietnam often reports Asia/Bangkok, hence the language check.
function guessLang() {
  try {
    if (VN_ZONES.includes(Intl.DateTimeFormat().resolvedOptions().timeZone)) return 'vi';
  } catch (e) { /* no Intl time zone */ }
  const langs = navigator.languages || [navigator.language || ''];
  return langs.some((l) => /^vi\b/i.test(l)) ? 'vi' : 'en';
}

// Country from Vercel's IP geolocation (api/country.js), kept for the browser session.
function detectLang() {
  const fromCountry = (c) => (c ? (c === 'VN' ? 'vi' : 'en') : guessLang());
  let cached = null;
  try { cached = sessionStorage.getItem(COUNTRY_KEY); } catch (e) { /* storage off */ }
  if (cached) return Promise.resolve(fromCountry(cached));
  return fetch('/api/country')
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => {
      const country = json && json.country;
      if (country) try { sessionStorage.setItem(COUNTRY_KEY, country); } catch (e) { /* storage off */ }
      return fromCountry(country);
    })
    .catch(guessLang);
}

const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
};

// Elements holding text of their own (not only through child elements), with that text.
function snapshotTexts() {
  const texts = new Map();
  document.querySelectorAll('.pg *').forEach((el) => {
    let own = '';
    el.childNodes.forEach((n) => { if (n.nodeType === 3) own += n.nodeValue; });
    if (own.trim()) texts.set(el, own);
  });
  return texts;
}

// After a switch, each piece of text that changed, header included, wipes in from the left.
// Only what's on screen animates; an element inside one that animates rides along.
function animateChanged(before) {
  const vh = window.innerHeight;
  const changed = new Set();
  before.forEach((text, el) => {
    if (!el.isConnected) return;
    let own = '';
    el.childNodes.forEach((n) => { if (n.nodeType === 3) own += n.nodeValue; });
    if (own === text) return;
    const r = el.getBoundingClientRect();
    if (r.width && r.bottom >= 0 && r.top <= vh) changed.add(el);
  });
  changed.forEach((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (changed.has(p)) return;
    el.animate(
      [{ clipPath: 'inset(-20% 100% -20% 0)', opacity: 0.2 }, { clipPath: 'inset(-20% -2% -20% 0)', opacity: 1 }],
      { duration: 550, easing: 'cubic-bezier(.22, .61, .36, 1)', fill: 'backwards' }
    );
  });
}

const LangContext = createContext(null);

// The prerender has no layout to measure; useLayoutEffect would only warn there.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('vi');
  const chosen = useRef(false); // the visitor picked a language: detection must not override it
  const pending = useRef(null); // texts before a switch the visitor made, to animate what changed

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* storage off */ }
    if (saved === 'vi' || saved === 'en') { setLangState(saved); return undefined; }
    let alive = true;
    detectLang().then((l) => { if (alive && !chosen.current) setLangState(l); });
    return () => { alive = false; };
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Before paint, so the new text never shows unanimated.
  useBrowserLayoutEffect(() => {
    const before = pending.current;
    pending.current = null;
    if (before) animateChanged(before);
  }, [lang]);

  // A switch the visitor makes is remembered and animated.
  const setLang = useCallback((l) => {
    chosen.current = true;
    try { localStorage.setItem(STORE_KEY, l); } catch (e) { /* storage off */ }
    if (!reducedMotion() && typeof Element.prototype.animate === 'function') pending.current = snapshotTexts();
    setLangState(l);
  }, []);

  const value = useMemo(() => {
    const en = lang === 'en';
    return {
      lang,
      setLang,
      // L('Việc làm', 'Jobs'): the text for the current language.
      L: (vi, enText) => (en ? enText : vi),
      // "6 vị trí" / "6 roles"
      roles: (n) => (en ? n + (n === 1 ? ' role' : ' roles') : n + ' vị trí'),
      // Salary inside a line of text: "Lương thỏa thuận" / "Negotiable"
      salaryText: (s) => (en ? s : 'Lương ' + s.toLowerCase()),
      locale: en ? 'en-US' : 'vi-VN'
    };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
