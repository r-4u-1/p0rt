import { act, fireEvent, render, screen } from '@testing-library/react';
import { useScrollerProgress } from './useScrollerProgress';

function Probe() {
  const ref = useScrollerProgress<HTMLDivElement>();
  return (
    <div data-testid="stage">
      <div ref={ref} data-testid="rail" />
      <p data-testid="readout" />
    </div>
  );
}

/**
 * jsdom has no layout, so the scroll geometry is declared outright.
 *
 * These are prototype-level overrides, which `jest.restoreAllMocks` knows
 * nothing about — left in place they leak into every later file in the same
 * worker, and jsdom's own descriptors have to be put back by hand.
 */
const ORIGINAL_DESCRIPTORS = {
  scrollWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth'),
  clientWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth'),
};

function geometry({ scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => scrollWidth,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
  });
}

function restoreGeometry() {
  for (const [name, descriptor] of Object.entries(ORIGINAL_DESCRIPTORS)) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
}

function scrollTo(left: number) {
  const rail = screen.getByTestId('rail');
  rail.scrollLeft = left;
  act(() => {
    fireEvent.scroll(rail);
    jest.runOnlyPendingTimers();
  });
}

/*
 * Read from the stage, not the rail: the value is published to the parent so
 * that the readout — a sibling of the rail — can actually see it.
 */
const rail = () => Number(screen.getByTestId('stage').style.getPropertyValue('--rail') || '0');

describe('useScrollerProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(0), 0) as unknown as number);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    restoreGeometry();
  });

  it('reports nothing before the rail has been moved', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    render(<Probe />);

    expect(rail()).toBe(0);
  });

  it('reports the fraction scrolled', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    render(<Probe />);

    scrollTo(500);

    expect(rail()).toBeCloseTo(0.5, 3);
  });

  it('reaches one at the far end', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    render(<Probe />);

    scrollTo(1000);

    expect(rail()).toBe(1);
  });

  it('clamps past the end, where a rubber-band overscroll lands', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    render(<Probe />);

    scrollTo(1400);

    expect(rail()).toBe(1);
  });

  /*
   * This is the pinned desktop case: the rail is a window, not a scroller,
   * and its progress comes from the page instead.
   */
  it('stays at zero when there is nothing to scroll', () => {
    geometry({ scrollWidth: 1000, clientWidth: 1000 });
    render(<Probe />);

    scrollTo(0);

    expect(rail()).toBe(0);
  });

  it('detaches its listeners on unmount', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    const { unmount } = render(<Probe />);
    const node = screen.getByTestId('rail');
    const remove = jest.spyOn(node, 'removeEventListener');
    const removeWindow = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeWindow.mock.calls.map(([event]) => event)).toContain('resize');
  });

  it('publishes where a sibling readout can read it, not onto the scroller', () => {
    geometry({ scrollWidth: 2000, clientWidth: 1000 });
    render(<Probe />);

    scrollTo(500);

    // Custom properties inherit downwards only. On the rail itself this value
    // would be invisible to the readout beside it.
    expect(screen.getByTestId('rail').style.getPropertyValue('--rail')).toBe('');
    expect(screen.getByTestId('stage').style.getPropertyValue('--rail')).toBe('0.5000');
  });
});