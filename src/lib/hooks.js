import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Animates 0 → 1 with ease-out-cubic once `start` turns true.
export function useTween(start, duration, delay = 0) {
  const reduce = usePrefersReducedMotion();
  const [p, setP] = useState(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) { setP(1); return undefined; }
    if (!start) return undefined;
    let raf = 0;
    let t0 = null;
    const timer = setTimeout(() => {
      const step = (now) => {
        if (t0 === null) t0 = now;
        const t = Math.min(1, (now - t0) / duration);
        setP(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [start, duration, delay, reduce]);
  return p;
}

// True once the element has scrolled at least `threshold` into view.
export function useInView(ref, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, seen]);
  return seen;
}
