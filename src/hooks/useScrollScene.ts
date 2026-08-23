import { useCallback, useEffect, useRef } from 'react';
import { useRafCallback } from './useRafCallback';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Scrubs a pinned scene with scroll. Attach the ref to a section that is
 * taller than the viewport and stick its inner stage; progress through the
 * extra height (the "runway") is written to the element as `--scene`, 0 at
 * the moment the section pins and 1 the moment it releases. The stylesheet
 * choreographs everything from that one number, which is why the effect is
 * identical under a finger on a phone and a wheel on a desktop — it is
 * plain geometry, not wheel or pointer trickery.
 *
 * Under prefers-reduced-motion the hook writes 0 once and stops listening,
 * so every derived transform collapses to its resting state.
 */
export function useScrollScene<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const runway = rect.height - window.innerHeight;
    const progress = runway > 0 ? Math.min(1, Math.max(0, -rect.top / runway)) : 0;
    node.style.setProperty('--scene', progress.toFixed(4));
  }, []);

  const onScroll = useRafCallback(update);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      node.style.setProperty('--scene', '0');
      return;
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reducedMotion, update, onScroll]);

  return ref;
}
