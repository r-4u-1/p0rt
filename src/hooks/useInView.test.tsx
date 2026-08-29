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

  /*
   * The page hides its content until this hook says otherwise, so silence
   * from the observer has to be treated as a failure rather than as "not
   * yet". A hidden tab, a prerender or a headless renderer never delivers an
   * intersection *and* never runs a transition, which without the failsafe
   * ships the whole page blank with nothing in the console to explain it.
   */
  describe('failsafe', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      document.documentElement.removeAttribute('data-reveal-fallback');
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      document.documentElement.removeAttribute('data-reveal-fallback');
    });

    it('reveals anyway when the observer never reports', () => {
      render(<Probe />);
      expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'false');

      act(() => {
        jest.advanceTimersByTime(1600);
      });

      expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'true');
    });

    it('flags the document so the stylesheet can drop the transitions too', () => {
      render(<Probe />);

      act(() => {
        jest.advanceTimersByTime(1600);
      });

      expect(document.documentElement).toHaveAttribute('data-reveal-fallback', 'true');
    });

    it('stands down as soon as the observer reports at all, even a miss', () => {
      render(<Probe />);

      act(() => triggerIntersection(false));
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'false');
      expect(document.documentElement).not.toHaveAttribute('data-reveal-fallback');
    });

    it('can be switched off', () => {
      render(<Probe failsafeMs={0} />);

      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      expect(screen.getByTestId('probe')).toHaveAttribute('data-in-view', 'false');
    });

    it('does not fire after the element has unmounted', () => {
      const { unmount } = render(<Probe />);
      unmount();

      expect(() =>
        act(() => {
          jest.advanceTimersByTime(5000);
        }),
      ).not.toThrow();
      expect(document.documentElement).not.toHaveAttribute('data-reveal-fallback');
    });
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
