import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { resetObservers, MockIntersectionObserver } from './intersectionObserver';
import { resetMotionForTests } from '@/motion/motionPreference';

expect.extend(toHaveNoViolations);

/** Restored after every test, so one case's stub cannot leak into the next. */
let defaultMatchMedia: typeof window.matchMedia;

/**
 * jsdom implements neither IntersectionObserver nor matchMedia, and both are
 * load-bearing for the scroll animations. Stubbing them here keeps every test
 * file free of boilerplate.
 */
beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  defaultMatchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: defaultMatchMedia,
  });

  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;

  /**
   * jsdom has no 2D canvas. `useCanvasScene` already treats a missing
   * context as "no art here" and does nothing, which is the correct
   * production behaviour too — but jsdom logs a "not implemented" error to
   * the virtual console on every call, which buries real failures. Returning
   * null explicitly is the same answer, quietly.
   */
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number) as typeof requestAnimationFrame;
    window.cancelAnimationFrame = ((id: number) =>
      clearTimeout(id)) as unknown as typeof cancelAnimationFrame;
  }
});

/*
 * The motion store is module state that outlives a test, so each case starts
 * from a page that moves and a system that has no opinion.
 *
 * Deliberately `beforeEach` rather than `afterEach`: resetting notifies the
 * store's subscribers, and Testing Library unmounts *after* this file's
 * hooks run — so tearing down here would push a state update into components
 * that are still mounted, and every one of them would warn about an update
 * outside `act`. Cleaning up on the way in has no such audience.
 */
beforeEach(() => {
  window.matchMedia = defaultMatchMedia;
  localStorage.clear();
  resetMotionForTests();
});

afterEach(() => {
  resetObservers();
});
