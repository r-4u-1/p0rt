import { act, render, screen } from '@testing-library/react';
import { useScrollScene } from './useScrollScene';

function Scene() {
  const ref = useScrollScene<HTMLDivElement>();
  return <div data-testid="scene" ref={ref} />;
}

function mockSceneGeometry(node: HTMLElement, { top, height }: { top: number; height: number }) {
  jest.spyOn(node, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        height,
        bottom: top + height,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect,
  );
}

function setInnerHeight(value: number) {
  Object.defineProperty(window, 'innerHeight', { value, configurable: true });
}

function readScene(node: HTMLElement): number {
  return Number(node.style.getPropertyValue('--scene'));
}

function fireScroll() {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    jest.runOnlyPendingTimers();
  });
}

describe('useScrollScene', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(0), 0) as unknown as number);
    setInnerHeight(1000);
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.useRealTimers();
  });

  it('reports zero while the scene is still pinned at the top', () => {
    render(<Scene />);
    const node = screen.getByTestId('scene');
    mockSceneGeometry(node, { top: 0, height: 3000 });

    fireScroll();

    expect(readScene(node)).toBe(0);
  });

  it('reports progress through the runway as the scene scrolls past', () => {
    render(<Scene />);
    const node = screen.getByTestId('scene');
    // Runway is height − viewport = 2000px; 1000px in means halfway.
    mockSceneGeometry(node, { top: -1000, height: 3000 });

    fireScroll();

    expect(readScene(node)).toBeCloseTo(0.5);
  });

  it('clamps to one once the scene has fully released', () => {
    render(<Scene />);
    const node = screen.getByTestId('scene');
    mockSceneGeometry(node, { top: -9999, height: 3000 });

    fireScroll();

    expect(readScene(node)).toBe(1);
  });

  it('reports zero when there is no runway to scrub', () => {
    render(<Scene />);
    const node = screen.getByTestId('scene');
    mockSceneGeometry(node, { top: -50, height: 800 });

    fireScroll();

    expect(readScene(node)).toBe(0);
  });

  it('pins the scene at zero and stays quiet under reduced motion', () => {
    const add = jest.spyOn(window, 'addEventListener');
    (window.matchMedia as jest.Mock | typeof window.matchMedia) = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as typeof window.matchMedia;

    render(<Scene />);
    const node = screen.getByTestId('scene');

    expect(readScene(node)).toBe(0);
    expect(add).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
  });

  it('detaches its listeners on unmount', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Scene />);
    unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
