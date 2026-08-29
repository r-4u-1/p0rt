import { act, render, screen } from '@testing-library/react';
import { useScrollProgress } from './useScrollProgress';

function Probe() {
  const ref = useScrollProgress<HTMLDivElement>();
  return <div ref={ref} data-testid="probe" />;
}

/** Places the probe at a given viewport offset with a given height. */
function place({ top, height }: { top: number; height: number }) {
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) });
}

function scroll() {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    jest.runOnlyPendingTimers();
  });
}

const read = (name: string) => screen.getByTestId('probe').style.getPropertyValue(name);

describe('useScrollProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // requestAnimationFrame is coalesced through a timer in this environment,
    // so pending frames flush with the fake clock.
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(0), 0) as unknown as number);
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('writes 0 while the element is still below the fold', () => {
    place({ top: 800, height: 400 });
    render(<Probe />);
    scroll();

    expect(read('--progress')).toBe('0.0000');
    expect(read('--drift')).toBe('-1.0000');
  });

  it('writes 1 once the element has left past the top', () => {
    place({ top: -400, height: 400 });
    render(<Probe />);
    scroll();

    expect(read('--progress')).toBe('1.0000');
    expect(read('--drift')).toBe('1.0000');
  });

  it('reads 0.5 — drift 0 — with the element centred', () => {
    // Travel spans innerHeight + height = 1200; halfway is top = 200.
    place({ top: 200, height: 400 });
    render(<Probe />);
    scroll();

    expect(read('--progress')).toBe('0.5000');
    expect(read('--drift')).toBe('0.0000');
  });

  it('clamps rather than overshooting once the element is far past', () => {
    place({ top: -5000, height: 400 });
    render(<Probe />);
    scroll();

    expect(read('--progress')).toBe('1.0000');
  });

  it('removes its listeners on unmount', () => {
    place({ top: 200, height: 400 });
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Probe />);

    unmount();

    const events = remove.mock.calls.map(([event]) => event);
    expect(events).toContain('scroll');
    expect(events).toContain('resize');
  });
});
