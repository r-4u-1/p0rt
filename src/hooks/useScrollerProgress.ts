import { useCallback, useEffect, useRef } from 'react';
import { useRafCallback } from './useRafCallback';

/**
 * How far a horizontally scrollable element has been scrolled, written to it
 * as `--rail` (0 → 1).
 *
 * The Stack rail traverses under a thumb on a phone and under a scroll-driven
 * transform on a desktop, and the readout beneath it has to report both. This
 * covers the first; `useScrollScene` covers the second; the stylesheet points
 * `--traverse` at whichever one the current layout is using, so the readout
 * itself never learns there are two modes.
 *
 * Writes 0 and stops when there is nothing to scroll, which is exactly the
 * desktop case — the listener stays attached but never fires, because a
 * non-scrollable element does not emit scroll events.
 *
 * The value is published onto the scroller's *parent*, not the scroller.
 * Custom properties inherit downwards only, and the readout that consumes
 * this is a sibling of the rail — it has to be, or it would scroll away with
 * the content it is reporting on. Setting the property on the rail itself
 * puts it exactly where nothing that needs it can see it.
 */
export function useScrollerProgress<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const span = node.scrollWidth - node.clientWidth;
    const progress = span > 1 ? Math.min(1, Math.max(0, node.scrollLeft / span)) : 0;
    // Falls back to the scroller when it has no parent, which only happens
    // in a detached tree — there is nothing to report to there anyway.
    (node.parentElement ?? node).style.setProperty('--rail', progress.toFixed(4));
  }, []);

  const onScroll = useRafCallback(measure);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    measure();
    node.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measure, onScroll]);

  return ref;
}
