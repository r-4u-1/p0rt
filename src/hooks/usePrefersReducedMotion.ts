import { useMotionPreference } from './useMotionPreference';

/**
 * Single source of truth for "should this animate?". Every motion hook asks
 * this one rather than re-implementing the media query.
 *
 * It used to *be* the media query. It is now a read of the motion store,
 * which starts from that query and lets the visitor override it — so adding
 * the toggle did not mean revisiting `useScrollScene`, `useCanvasScene`,
 * `usePointerSpot`, `Reveal` or `TimelineItem`. They all already asked the
 * right question; only the answer got better.
 */
export function usePrefersReducedMotion(): boolean {
  return useMotionPreference().reduced;
}
