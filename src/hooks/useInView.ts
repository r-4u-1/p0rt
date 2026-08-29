import { useEffect, useRef, useState } from 'react';

/**
 * Flags the document the first time a reveal has to fall back.
 *
 * Revealing is only half the repair: a document that does not deliver
 * intersections does not run transitions either, so flipping the state
 * leaves every element parked on its *starting* keyframe — still invisible,
 * now for a second reason. The attribute lets one rule in `global.css`
 * collapse every duration to zero, so the end state applies outright.
 */
function markRevealFallback(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-reveal-fallback', 'true');
}

export interface UseInViewOptions {
  /** Fraction of the element that must be visible before it counts. */
  readonly threshold?: number;
  /** Trigger slightly before the element reaches the fold. */
  readonly rootMargin?: string;
  /** Reveal animations should not replay on scroll-up. */
  readonly once?: boolean;
  /**
   * How long to wait for the observer to say anything at all before
   * revealing regardless. See the note below; set to 0 to disable.
   */
  readonly failsafeMs?: number;
}

/**
 * Thin, typed wrapper around IntersectionObserver.
 * Works identically on desktop and touch devices — no scroll listener needed.
 *
 * ---- Why the failsafe ----
 * An IntersectionObserver in a *hidden* document never delivers, and the
 * page hides its content until this hook says otherwise. Background tabs
 * (a middle-clicked link, a restored session), prerenders, headless
 * screenshotters and print pipelines therefore render every section at
 * `opacity: 0` and keep it there — the whole page, blank, with no error
 * anywhere to explain it.
 *
 * So the hook treats silence as a failure rather than as "not yet". The
 * first callback of *any* kind proves the observer is alive and cancels the
 * timer; only genuine silence trips it. A visitor who opens the tab within
 * the window still gets the full choreography, because the observer wakes
 * with the document and reports before the timer runs out.
 */
export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0.18,
  rootMargin = '0px 0px -8% 0px',
  once = true,
  failsafeMs = 1600,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Environments without IO (older browsers, some test runners) get content
    // immediately rather than a blank page.
    if (typeof IntersectionObserver === 'undefined') {
      markRevealFallback();
      setInView(true);
      return;
    }

    let failsafe: ReturnType<typeof setTimeout> | null =
      failsafeMs > 0
        ? setTimeout(() => {
            markRevealFallback();
            setInView(true);
          }, failsafeMs)
        : null;

    const clearFailsafe = () => {
      if (failsafe === null) return;
      clearTimeout(failsafe);
      failsafe = null;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Any delivery at all means the observer is working; from here on
        // it is the only thing allowed to decide.
        clearFailsafe();
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => {
      clearFailsafe();
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, failsafeMs]);

  return { ref, inView } as const;
}
