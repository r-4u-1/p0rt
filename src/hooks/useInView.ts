import { useEffect, useRef, useState } from 'react';

export interface UseInViewOptions {
  /** Fraction of the element that must be visible before it counts. */
  readonly threshold?: number;
  /** Trigger slightly before the element reaches the fold. */
  readonly rootMargin?: string;
  /** Reveal animations should not replay on scroll-up. */
  readonly once?: boolean;
}

/**
 * Thin, typed wrapper around IntersectionObserver.
 * Works identically on desktop and touch devices — no scroll listener needed.
 */
export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0.18,
  rootMargin = '0px 0px -8% 0px',
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Environments without IO (older browsers, some test runners) get content
    // immediately rather than a blank page.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
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
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}
