import { act, render, screen } from '@testing-library/react';
import { useCanvasScene } from './useCanvasScene';
import type { Scene } from '@/art/scene';
import { createFakeContext } from '@/test/fakeCanvasContext';
import { triggerIntersection } from '@/test/intersectionObserver';

interface ProbeProps {
  readonly scene: Scene;
  readonly replay?: boolean;
  readonly delay?: number;
  readonly onBuild?: () => void;
}

function Probe({ scene, replay, delay = 0, onBuild }: ProbeProps) {
  const factory = () => {
    onBuild?.();
    return scene;
  };
  const { canvasRef, disabled } = useCanvasScene({ factory, replay, delay });
  return disabled ? <p data-testid="disabled" /> : <canvas ref={canvasRef} data-testid="canvas" />;
}

/** Advances the fake clock past the start delay and runs `frames` frames. */
function tick(frames = 1) {
  act(() => {
    jest.advanceTimersByTime(16 * frames + 1);
  });
}

function reducedMotion(value: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: value && query.includes('reduce'),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

describe('useCanvasScene', () => {
  const originalMatchMedia = window.matchMedia;
  let fake = createFakeContext();

  beforeEach(() => {
    jest.useFakeTimers();
    fake = createFakeContext();
    HTMLCanvasElement.prototype.getContext = (() =>
      fake.ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    // Jest's modern fake timers already drive requestAnimationFrame at 16ms
    // a frame. Spying on it as well hands the hook a setTimeout id that
    // cancelAnimationFrame then refuses to clear on unmount.
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.matchMedia = originalMatchMedia;
  });

  it('does not paint until the canvas is in view', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} />);

    tick(5);

    expect(frame).not.toHaveBeenCalled();
  });

  it('runs once the canvas comes into view', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} />);

    act(() => triggerIntersection(true));
    tick(3);

    expect(frame).toHaveBeenCalled();
  });

  it('stops when the canvas leaves the viewport', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} />);
    act(() => triggerIntersection(true));
    tick(3);

    const painted = frame.mock.calls.length;
    act(() => triggerIntersection(false));
    tick(10);

    expect(frame.mock.calls.length).toBe(painted);
  });

  it('stops while the document is hidden', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} />);
    act(() => triggerIntersection(true));
    tick(3);
    const painted = frame.mock.calls.length;

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    tick(10);

    expect(frame.mock.calls.length).toBe(painted);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  it('clamps the first step so a resumed tab cannot jump the animation', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} />);
    act(() => triggerIntersection(true));
    tick(4);

    for (const [state] of frame.mock.calls) {
      expect(state.delta).toBeLessThanOrEqual(48);
    }
  });

  it('stops for good once the scene reports itself finished', () => {
    const frame = jest.fn().mockReturnValue(false);
    render(<Probe scene={{ frame }} replay={false} />);
    act(() => triggerIntersection(true));
    tick(6);

    expect(frame).toHaveBeenCalledTimes(1);
    expect(fake.count('clearRect')).toBeGreaterThan(0);
  });

  it('builds a fresh scene on each replay, so the art is not a rerun', () => {
    const onBuild = jest.fn();
    const frame = jest.fn().mockReturnValue(false);
    render(<Probe scene={{ frame }} replay onBuild={onBuild} />);

    act(() => triggerIntersection(true));
    tick(3);
    act(() => triggerIntersection(false));
    act(() => triggerIntersection(true));
    tick(3);

    expect(onBuild).toHaveBeenCalledTimes(2);
  });

  it('tells the scene about its size before the first frame', () => {
    const resize = jest.fn();
    render(<Probe scene={{ frame: jest.fn(), resize }} />);
    act(() => triggerIntersection(true));
    tick(2);

    expect(resize).toHaveBeenCalled();
  });

  it('renders nothing at all under reduced motion', () => {
    reducedMotion(true);
    const frame = jest.fn();

    render(<Probe scene={{ frame }} />);
    act(() => triggerIntersection(true));
    tick(5);

    expect(screen.getByTestId('disabled')).toBeInTheDocument();
    expect(frame).not.toHaveBeenCalled();
  });

  it('waits out the start delay before the first frame', () => {
    const frame = jest.fn();
    render(<Probe scene={{ frame }} delay={500} />);
    act(() => triggerIntersection(true));

    tick(2);
    expect(frame).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(frame).toHaveBeenCalled();
  });
});
