import { act } from '@testing-library/react';
import { refreshMotion } from '@/motion/motionPreference';

export interface FakeMedia {
  /** Change what a query reports and notify anything listening. */
  set(query: string, matches: boolean): void;
  readonly listenerCount: number;
}

/**
 * A controllable `matchMedia` whose listeners a test can fire by hand.
 *
 * jsdom's stub answers every query with `false` and never changes its mind,
 * which is fine for "assume the narrow layout" and useless for anything that
 * behaves differently across a breakpoint. Queries not listed simply report
 * false, so a test only has to name the ones it cares about.
 */
export function installMatchMedia(initial: Record<string, boolean> = {}): FakeMedia {
  const state = new Map(Object.entries(initial));
  const listeners = new Map<string, Set<() => void>>();

  const listenersFor = (query: string) => {
    const existing = listeners.get(query);
    if (existing) return existing;
    const created = new Set<() => void>();
    listeners.set(query, created);
    return created;
  };

  window.matchMedia = ((query: string) => ({
    get matches() {
      return state.get(query) ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: () => void) => listenersFor(query).add(fn),
    removeEventListener: (_: string, fn: () => void) => listenersFor(query).delete(fn),
    addListener: (fn: () => void) => listenersFor(query).add(fn),
    removeListener: (fn: () => void) => listenersFor(query).delete(fn),
    dispatchEvent: () => true,
  })) as unknown as typeof window.matchMedia;

  // The motion store cached an answer from the previous matchMedia.
  refreshMotion();

  return {
    set(query: string, matches: boolean) {
      state.set(query, matches);
      act(() => listenersFor(query).forEach((fn) => fn()));
    },
    get listenerCount() {
      let total = 0;
      for (const set of listeners.values()) total += set.size;
      return total;
    },
  };
}
