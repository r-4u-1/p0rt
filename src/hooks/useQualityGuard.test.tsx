import { act, render } from '@testing-library/react';
import { useQualityGuard } from './useQualityGuard';
import { setSystemReducedMotion } from '@/test/motion';

function Probe() {
  useQualityGuard();
  return null;
}

const quality = () => document.documentElement.dataset.quality;

/*
 * Frames are driven by hand rather than by Jest's fake `requestAnimationFrame`,
 * which ticks at a fixed 16ms and so can only ever describe a device that is
 * keeping up — the one case this hook does not need to detect. Owning the
 * clock is what lets a test say "this frame took 60ms".
 */
let pending: FrameRequestCallback | null = null;
let clock = 0;

function paint(frames: number, frameMs: number) {
  for (let i = 0; i < frames; i += 1) {
    const callback = pending;
    if (!callback) return;
    pending = null;
    clock += frameMs;
    act(() => callback(clock));
  }
}

/** Past the settle delay, so sampling has begun. */
function settle() {
  act(() => {
    jest.advanceTimersByTime(2000);
  });
}

describe('useQualityGuard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    pending = null;
    clock = 0;
    delete document.documentElement.dataset.quality;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      pending = callback;
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      pending = null;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete document.documentElement.dataset.quality;
  });

  it('leaves a device that keeps up alone', () => {
    render(<Probe />);
    settle();

    paint(140, 16);

    expect(quality()).toBeUndefined();
  });

  it('sheds load on a device that cannot keep up', () => {
    render(<Probe />);
    settle();

    paint(140, 60);

    expect(quality()).toBe('low');
  });

  it('tolerates the occasional dropped frame', () => {
    render(<Probe />);
    settle();

    // Roughly one frame in eight is long — a hiccup, not a slow device.
    for (let i = 0; i < 160; i += 1) paint(1, i % 8 === 0 ? 60 : 16);

    expect(quality()).toBeUndefined();
  });

  /*
   * The page is slow *while* the browser is starting up, laying out and
   * decoding fonts. Judging it then would fail every device.
   */
  it('does not judge the device while the page is still starting up', () => {
    render(<Probe />);

    paint(140, 60);

    expect(quality()).toBeUndefined();
  });

  /*
   * A backgrounded tab resumes with one enormous delta. That is the browser
   * pausing us, not the device failing.
   */
  it('ignores the giant frame a backgrounded tab resumes with', () => {
    render(<Probe />);
    settle();

    paint(1, 30_000);
    paint(140, 16);

    expect(quality()).toBeUndefined();
  });

  it('never measures at all when there is nothing expensive running', () => {
    setSystemReducedMotion(true);
    render(<Probe />);
    settle();

    paint(140, 60);

    expect(quality()).toBeUndefined();
  });

  /*
   * Shedding load makes frames cheap again, which would restore the load
   * that made them expensive. The verdict has to be final or it oscillates.
   */
  it('only ever degrades, and only once', () => {
    render(<Probe />);
    settle();
    paint(140, 60);
    expect(quality()).toBe('low');

    paint(200, 8);

    expect(quality()).toBe('low');
  });

  it('stops sampling as soon as it has a verdict', () => {
    render(<Probe />);
    settle();

    paint(140, 60);

    expect(pending).toBeNull();
  });

  it('stops measuring when it unmounts', () => {
    const { unmount } = render(<Probe />);
    settle();

    unmount();
    paint(200, 60);

    expect(quality()).toBeUndefined();
  });
});
