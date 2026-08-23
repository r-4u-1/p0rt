import { useEffect, useState } from 'react';

/**
 * Marks the section currently under the reading line so the nav and the
 * scroll spine can highlight it. Uses IntersectionObserver only — no scroll
 * maths, which keeps it cheap on mobile.
 */
export function useActiveSection(ids: readonly string[], initial = ''): string {
  const [active, setActive] = useState(initial);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: '-15% 0px -45% 0px' },
    );

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
