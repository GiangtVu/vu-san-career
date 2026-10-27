import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// Pages are prerendered at build time (scripts/prerender.mjs), where there is no window.
// useSyncExternalStore renders the server value (false) while hydrating, so the first render
// matches the prerendered HTML, then switches to the real value. Client-only mounts get the
// real value straight away.
export function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

const subscribeNever = () => () => {};

// False while prerendering and hydrating, true after. Gate anything that reads the clock,
// localStorage or the like behind it so it can't differ from the prerendered HTML.
export function useHydrated() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
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
