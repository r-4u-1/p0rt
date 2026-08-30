import { resetMotionForTests } from '@/motion/motionPreference';

/**
 * Puts the environment's reduced-motion answer under a test's control.
 *
 * The motion store caches its snapshot — `useSyncExternalStore` compares by
 * identity and would loop on a freshly-built object every read — so swapping
 * `window.matchMedia` is only half of the job; the store has to be told the
 * ground truth moved. Doing both in one place keeps that coupling out of
 * every test that just wants to say "this visitor asked for less motion".
 */
export function setSystemReducedMotion(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;

  resetMotionForTests();
}
