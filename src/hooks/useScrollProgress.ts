import { useCallback, useEffect, useRef } from 'react';
import { useRafCallback } from './useRafCallback';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Traversal progress for any element, written to it as two CSS variables.
 *
 *   --progress  0 the moment the element's top reaches the bottom of the
 *               viewport, 1 the moment its bottom leaves the top.
 *   --drift     the same number remapped to -1 → 0 → 1, so 0 is "centred in
 *               the viewport". Counter-scrolling two columns is then a sign
 *               flip rather than two different measurements.
 *
 * Sibling of `useScrollScene`, and deliberately not the same hook.
 * `useScrollScene` measures a *pinned* section against its own runway, which
 * only means anything while the stage is stuck. This one measures an
 * ordinary section against the viewport, which is what every non-pinned
 * scroll effect on the page actually wants.
 *
 * Everything derived from these lives in CSS, so a section's choreography is
 * readable in one place instead of being split across a component and a
 * stylesheet. Under prefers-reduced-motion the hook writes the resting
 * values once and never listens, collapsing every derived transform.
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    // Total distance travelled from "just below the fold" to "just above it".
    const span = window.innerHeight + rect.height;
    const travelled = window.innerHeight - rect.top;
    const progress = span > 0 ? Math.min(1, Math.max(0, travelled / span)) : 0;

    node.style.setProperty('--progress', progress.toFixed(4));
    node.style.setProperty('--drift', (progress * 2 - 1).toFixed(4));
  }, []);

  const onScroll = useRafCallback(update);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      // Mid-traversal and centred: the resting pose of every effect below.
      node.style.setProperty('--progress', '0.5');
      node.style.setProperty('--drift', '0');
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
