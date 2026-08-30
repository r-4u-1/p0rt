/**
 * One source of truth for "should this page move?".
 *
 * The system preference is the default, not the verdict. A visitor whose OS
 * is set to reduce motion may still want to see what the page does; a
 * visitor on a default machine may find it too much halfway down. Both are
 * legitimate, and neither is expressible with a media query alone — so the
 * media query becomes the *initial* value of a setting the visitor owns, and
 * everything on the page reads the resolved answer from here.
 *
 * Deliberately a module-level store rather than a React context: the answer
 * is genuinely global, several non-React places need it (the `data-motion`
 * attribute the stylesheet keys off), and `useSyncExternalStore` gives
 * tearing-free reads without wrapping the tree in another provider.
 */

export type MotionSetting = 'system' | 'on' | 'off';

export interface MotionSnapshot {
  /** What the visitor chose. `system` means "follow the OS". */
  readonly setting: MotionSetting;
  /** The resolved answer every hook and stylesheet acts on. */
  readonly reduced: boolean;
}

const STORAGE_KEY = 'portfolio:motion';
const QUERY = '(prefers-reduced-motion: reduce)';

const listeners = new Set<() => void>();

function readStoredSetting(): MotionSetting {
  if (typeof localStorage === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'on' || stored === 'off' ? stored : 'system';
  } catch {
    // Private mode, disabled storage, or a blocked third-party context.
    return 'system';
  }
}

function systemPrefersReduced(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function resolve(setting: MotionSetting): boolean {
  if (setting === 'off') return true;
  if (setting === 'on') return false;
  return systemPrefersReduced();
}

let setting: MotionSetting = readStoredSetting();
/*
 * Cached because `useSyncExternalStore` compares snapshots by identity and
 * will loop forever on a getSnapshot that builds a fresh object each call.
 */
let snapshot: MotionSnapshot = { setting, reduced: resolve(setting) };

/**
 * Mirrors the resolved answer onto the document so CSS can key off it.
 * `--motion` is the page's one motion switch; this is what flips it outside
 * of the media query.
 */
function syncDocument(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.motion = snapshot.reduced ? 'off' : 'on';
}

function publish(): void {
  const next = resolve(setting);
  if (snapshot.setting === setting && snapshot.reduced === next) return;
  snapshot = { setting, reduced: next };
  syncDocument();
  for (const listener of listeners) listener();
}

export function getMotionSnapshot(): MotionSnapshot {
  return snapshot;
}

/** Stable across renders, so it is safe as a `getServerSnapshot`. */
const SERVER_SNAPSHOT: MotionSnapshot = { setting: 'system', reduced: false };

export function getServerMotionSnapshot(): MotionSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener);

  // The OS preference can change while the page is open, and it only matters
  // while the setting is still following it.
  const media =
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(QUERY) : null;
  const onSystemChange = () => {
    if (setting === 'system') publish();
  };

  if (media?.addEventListener) media.addEventListener('change', onSystemChange);
  else media?.addListener?.(onSystemChange);

  return () => {
    listeners.delete(listener);
    if (media?.removeEventListener) media.removeEventListener('change', onSystemChange);
    else media?.removeListener?.(onSystemChange);
  };
}

export function setMotionSetting(next: MotionSetting): void {
  setting = next;
  try {
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // A rejected write must not stop the setting applying for this visit.
  }
  publish();
}

/**
 * Applies the stored answer to the document before React mounts, so a
 * visitor who turned motion off does not get one frame of it on every load.
 */
export function initialiseMotion(): void {
  snapshot = { setting, reduced: resolve(setting) };
  syncDocument();
}

/**
 * Re-reads the environment and republishes.
 *
 * The system preference is normally tracked by the media listener in
 * `subscribeMotion`, which is enough in a browser. It is not enough anywhere
 * the environment can be swapped out from under the module — a test that
 * replaces `window.matchMedia` changes the answer without emitting a change
 * event, and the cached snapshot would go on reporting the old one.
 */
export function refreshMotion(): void {
  setting = readStoredSetting();
  const reduced = resolve(setting);
  if (snapshot.setting === setting && snapshot.reduced === reduced) return;
  snapshot = { setting, reduced };
  syncDocument();
  for (const listener of listeners) listener();
}

/**
 * Test seam: forgets the visitor's choice and re-reads the environment.
 * Subscribers are kept — a test that swaps the media query mid-render still
 * expects its mounted components to hear about it.
 */
export function resetMotionForTests(): void {
  setting = 'system';
  snapshot = { setting, reduced: resolve(setting) };
  if (typeof document !== 'undefined') delete document.documentElement.dataset.motion;
  for (const listener of listeners) listener();
}
