import { act, render } from '@testing-library/react';
import { useScrollVelocity } from './useScrollVelocity';
import { setSystemReducedMotion } from '@/test/motion';

function Probe() {
  useScrollVelocity();
  return null;
}

const root = () => document.documentElement;
const velocity = () => Number(root().style.getPropertyValue('--velocity') || '0');
const signed = () => Number(root().style.getPropertyValue('--velocity-signed') || '0');

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: y });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

/** Runs the measurement loop for `frames` animation frames. */
function frames(count: number) {
  act(() => {
    jest.advanceTimersByTime(17 * count);
  });
}

describe('useScrollVelocity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    root().style.removeProperty('--velocity');
    root().style.removeProperty('--velocity-signed');
  });

  afterEach(() => {
    jest.useRealTimers();
    root().style.removeProperty('--velocity');
    root().style.removeProperty('--velocity-signed');
  });

  it('stays at rest on a page nobody is scrolling', () => {
    render(<Probe />);
    frames(10);

    expect(velocity()).toBe(0);
  });

  it('rises while the page is being thrown', () => {
    render(<Probe />);

    scrollTo(400);
    for (let i = 1; i <= 8; i += 1) {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 400 + i * 200,
      });
      frames(1);
    }

    expect(velocity()).toBeGreaterThan(0.3);
  });

  it('reads lower for the same distance covered slowly', () => {
    render(<Probe />);
    scrollTo(0);
    for (let i = 1; i <= 8; i += 1) {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: i * 4,
      });
      frames(1);
    }

    expect(velocity()).toBeLessThan(0.2);
  });

  it('never exceeds one, however hard the page is flung', () => {
    render(<Probe />);
    scrollTo(0);
    for (let i = 1; i <= 30; i += 1) {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: i * 5000,
      });
      frames(1);
    }

    expect(velocity()).toBeLessThanOrEqual(1);
  });

  it('signs the reading by direction', () => {
    render(<Probe />);
    scrollTo(0);
    for (let i = 1; i <= 8; i += 1) {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 4000 - i * 300,
      });
      frames(1);
    }

    expect(signed()).toBeLessThan(0);
  });

  /*
   * A custom property on :root invalidates everything that reads it, so an
   * idle page must cost nothing at all — not a cheap frame, no frame.
   */
  it('settles back to zero and stops measuring once scrolling ends', () => {
    render(<Probe />);
    scrollTo(0);
    for (let i = 1; i <= 6; i += 1) {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: i * 400,
      });
      frames(1);
    }
    expect(velocity()).toBeGreaterThan(0);

    // Stop moving and let the smoothing decay.
    frames(120);
    expect(velocity()).toBe(0);

    const raf = jest.spyOn(window, 'requestAnimationFrame');
    frames(30);
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });

  it('publishes a flat zero and never listens under reduced motion', () => {
    setSystemReducedMotion(true);
    const add = jest.spyOn(window, 'addEventListener');

    render(<Probe />);

    expect(velocity()).toBe(0);
    expect(add).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
    add.mockRestore();
  });

  it('cleans its properties off the document on unmount', () => {
    const { unmount } = render(<Probe />);
    scrollTo(500);
    frames(2);

    unmount();

    expect(root().style.getPropertyValue('--velocity')).toBe('');
    expect(root().style.getPropertyValue('--velocity-signed')).toBe('');
  });
});
