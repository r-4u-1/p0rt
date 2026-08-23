import { act, renderHook } from '@testing-library/react';
import { useScrollProgress } from './useScrollProgress';

function setScrollMetrics({
  scrollY,
  scrollHeight,
  innerHeight,
}: {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
}) {
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
}

describe('useScrollProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(0), 0) as unknown as number);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at zero at the top of the page', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('reports the fraction of the document that has been scrolled', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { result } = renderHook(() => useScrollProgress());

    setScrollMetrics({ scrollY: 1000, scrollHeight: 3000, innerHeight: 1000 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toBeCloseTo(0.5);
  });

  it('clamps to one at the bottom rather than overshooting', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { result } = renderHook(() => useScrollProgress());

    setScrollMetrics({ scrollY: 9999, scrollHeight: 3000, innerHeight: 1000 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toBe(1);
  });

  it('reports zero when the page is too short to scroll', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 800, innerHeight: 1000 });
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('coalesces a burst of scroll events into a single frame', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    renderHook(() => useScrollProgress());
    const raf = window.requestAnimationFrame as unknown as jest.Mock;
    raf.mockClear();

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
    });

    expect(raf).toHaveBeenCalledTimes(1);
  });

  it('detaches its listeners on unmount', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollProgress());
    unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
