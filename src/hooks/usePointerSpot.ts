import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Writes the pointer's position within a child element as `--px` / `--py`
 * (0 → 1 on each axis), so a stylesheet can put a highlight under the cursor.
 *
 * One listener on the container rather than one per card: a six-card grid
 * would otherwise mean six `pointermove` handlers competing for the same
 * events, and the count grows with the data. The handler resolves the card
 * from the event target and writes only to that one.
 *
 * Bound to `pointermove` with a `pointerType` guard rather than to
 * `mousemove`: a touch drag across a card would otherwise leave a highlight
 * stranded where the finger lifted, since there is no pointer to follow.
 */
export function usePointerSpot<T extends HTMLElement = HTMLElement>(childSelector: string) {
  const ref = useRef<T | null>(null);
  const activeRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const clear = useCallback(() => {
    const previous = activeRef.current;
    if (!previous) return;
    previous.style.removeProperty('--px');
    previous.style.removeProperty('--py');
    previous.removeAttribute('data-spot');
    activeRef.current = null;
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;

      const target = event.target as Element | null;
      const card = target?.closest<HTMLElement>(childSelector) ?? null;
      if (!card || !node.contains(card)) {
        clear();
        return;
      }

      if (card !== activeRef.current) {
        clear();
        activeRef.current = card;
        card.setAttribute('data-spot', 'true');
      }

      const rect = card.getBoundingClientRect();
      card.style.setProperty('--px', ((event.clientX - rect.left) / rect.width).toFixed(3));
      card.style.setProperty('--py', ((event.clientY - rect.top) / rect.height).toFixed(3));
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', clear);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', clear);
      clear();
    };
  }, [childSelector, clear, reducedMotion]);

  return ref;
}
