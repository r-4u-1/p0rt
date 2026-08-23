import { act, render, screen } from '@testing-library/react';
import { useInView, type UseInViewOptions } from './useInView';
import { observedElementCount, triggerIntersection } from '@/test/intersectionObserver';

/**
 * The hook attaches its ref during render, so it is exercised through a
 * component rather than `renderHook` — that is how it is actually used.
 */
function Probe(options: UseInViewOptions = {}) {
  const { ref, inView } = useInView<HTMLDivElement>(options);
  return (
    <div ref={ref} data-testid="probe" data-in-view={inView ? 'true' : 'false'}>
      Probe
    </div>
  );
}

describe('useInView', () => {
  it('reports false until the element intersects', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'false');
  });

  it('observes the element it is attached to', () => {
    render(<Probe />);
    expect(observedElementCount()).toBe(1);
  });

  it('flips to true once the element intersects', () => {
    render(<Probe />);

    act(() => triggerIntersection(true));

    expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'true');
  });

  it('stops observing after the first reveal by default', () => {
    render(<Probe />);

    act(() => triggerIntersection(true));

    expect(observedElementCount()).toBe(0);
  });

  it('can be told to track visibility in both directions', () => {
    render(<Probe once={false} />);

    act(() => triggerIntersection(true));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'true');

    act(() => triggerIntersection(false));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'false');
  });

  it('shows content immediately where IntersectionObserver is unavailable', () => {
    const original = window.IntersectionObserver;
    // @ts-expect-error deliberately removing the API to exercise the fallback
    delete window.IntersectionObserver;
    // @ts-expect-error the hook reads the global reference too
    delete global.IntersectionObserver;

    try {
      render(<Probe />);
      expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'true');
    } finally {
      window.IntersectionObserver = original;
      global.IntersectionObserver = original;
    }
  });
});
