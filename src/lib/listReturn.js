// Where the visitor left the job list (filters, page, scroll position), so that coming back to it
// from a job page shows the list as they left it instead of starting over.
const KEY = 'vs-list-state';

let previousPath = null; // the page shown before the current one, kept by App.jsx
let skipScrollTop = false;

export function notePath(path) {
  previousPath = path;
}

// Called while the list renders, before App.jsx records the new page.
export function cameFromJob() {
  return !!previousPath && previousPath.startsWith('/viec-lam/');
}

export function readListState() {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
}

export function saveListState(state) {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage off */ }
}

// The list URL as the visitor left it (with its ?q= and the like), for the job page's back links.
export function listReturnPath() {
  const s = readListState();
  return '/viec-lam' + ((s && s.search) || '');
}

// The list restores its own scroll position; App.jsx must not jump to the top over it.
export function keepScroll() {
  skipScrollTop = true;
}

export function takeKeepScroll() {
  const v = skipScrollTop;
  skipScrollTop = false;
  return v;
}
