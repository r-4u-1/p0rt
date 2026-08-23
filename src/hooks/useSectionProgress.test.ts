import { act, renderHook } from '@testing-library/react';
import { useSectionProgress } from './useSectionProgress';

const IDS = ['about', 'stack', 'projects'] as const;

/**
 * Lays the sections out at fixed document offsets. The rect is derived from
 * the live scroll position so the elements behave like real ones as the page
 * moves under them.
 */
function layout(tops: Readonly<Record<string, number>>) {
  document.body.innerHTML = '';
  for (const [id, top] of Object.entries(tops)) {
    const node = document.createElement('section');
    node.id = id;
    jest
      .spyOn(node, 'getBoundingClientRect')
      .mockImplementation(() => ({ top: top - window.scrollY }) as DOMRect);
    document.body.append(node);
  }
}

function setScroll(scrollY: number) {
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
}

/** Scroll position that puts the given document offset on the reading line. */
function scrollThatReaches(top: number): number {
  return top - window.innerHeight * 0.35;
}

function scrollTo(scrollY: number) {
  setScroll(scrollY);
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    jest.runOnlyPendingTimers();
  });
}

describe('useSectionProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(0), 0) as unknown as number);
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    setScroll(0);
    layout({ about: 1000, stack: 3000, projects: 5000 });
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('stays at zero while the first section is still below the reading line', () => {
    const { result } = renderHook(() => useSectionProgress(IDS));
    expect(result.current).toBe(0);
  });

  it('puts the fill on a marker exactly as that section reaches the reading line', () => {
    const { result } = renderHook(() => useSectionProgress(IDS));

    scrollTo(scrollThatReaches(1000));
    expect(result.current).toBeCloseTo(0); // marker 1 of 3

    scrollTo(scrollThatReaches(3000));
    expect(result.current).toBeCloseTo(0.5); // marker 2 of 3

    scrollTo(scrollThatReaches(5000));
    expect(result.current).toBeCloseTo(1); // marker 3 of 3
  });

  it('interpolates evenly between two markers regardless of section height', () => {
    const { result } = renderHook(() => useSectionProgress(IDS));

    // Halfway between about and stack is halfway between their markers…
    scrollTo(scrollThatReaches(2000));
    expect(result.current).toBeCloseTo(0.25);

    // …and the same holds across a gap of a different size.
    layout({ about: 1000, stack: 3000, projects: 3400 });
    scrollTo(scrollThatReaches(3200));
    expect(result.current).toBeCloseTo(0.75);
  });

  it('ignores scrolling that happens before the first section, however long', () => {
    const { result } = renderHook(() => useSectionProgress(IDS));

    scrollTo(scrollThatReaches(200));
    expect(result.current).toBe(0);

    scrollTo(scrollThatReaches(999));
    expect(result.current).toBe(0);
  });

  it('holds at one past the last section rather than overshooting', () => {
    const { result } = renderHook(() => useSectionProgress(IDS));

    scrollTo(scrollThatReaches(99999));
    expect(result.current).toBe(1);
  });

  it('reports zero when there are not two sections to measure between', () => {
    const { result } = renderHook(() => useSectionProgress(['about']));
    expect(result.current).toBe(0);
  });

  it('skips sections that are not on the page', () => {
    layout({ about: 1000, projects: 5000 });
    const { result } = renderHook(() => useSectionProgress(IDS));

    scrollTo(scrollThatReaches(5000));
    expect(result.current).toBe(1);

    scrollTo(scrollThatReaches(1000));
    expect(result.current).toBe(0);
  });

  it('coalesces a burst of scroll events into a single frame', () => {
    renderHook(() => useSectionProgress(IDS));
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
    const { unmount } = renderHook(() => useSectionProgress(IDS));
    unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
