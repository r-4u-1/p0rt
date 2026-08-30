import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** A frame this long has missed its slot at 60Hz by a wide margin. */
const LONG_FRAME_MS = 34;
/** Frames sampled before a verdict. */
const WINDOW = 90;
/** Share of long frames that means "this device is struggling". */
const FAIL_RATIO = 0.28;
/** Sampling starts late, so a cold start is not mistaken for a slow device. */
const SETTLE_MS = 1800;

/**
 * Measures what the page actually costs on this device, once, and drops the
 * expensive layers if it cannot keep up.
 *
 * Claiming 60fps without measuring it is a guess, and the decorative layers
 * here — two canvases, blurred glows, a pinned scrub — are exactly the sort
 * of thing that is free on a laptop and miserable on a four-year-old phone.
 * Rather than pick a breakpoint and hope, this samples frame times after the
 * page has settled and sets `data-quality="low"`, which the stylesheets read
 * to thin the art out.
 *
 * It only ever degrades, and only once. A guard that could re-upgrade would
 * oscillate — shedding load makes frames cheap again, which would restore
 * the load that made them expensive — so the verdict is final for the visit.
 */
export function useQualityGuard(): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Nothing expensive is running, so there is nothing to measure or shed.
    if (reducedMotion) return;

    const root = document.documentElement;
    if (root.dataset.quality === 'low') return;

    let frame: number | null = null;
    let settle: ReturnType<typeof setTimeout> | null = null;
    let previous = 0;
    let sampled = 0;
    let long = 0;

    const tick = (now: number) => {
      if (previous !== 0) {
        // A hidden tab produces one enormous delta on resume; that is the
        // browser pausing us, not the device failing, so it is not a sample.
        const delta = now - previous;
        if (delta < 500) {
          sampled += 1;
          if (delta > LONG_FRAME_MS) long += 1;
        }
      }
      previous = now;

      if (sampled >= WINDOW) {
        if (long / sampled > FAIL_RATIO) root.dataset.quality = 'low';
        frame = null;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    settle = setTimeout(() => {
      settle = null;
      frame = requestAnimationFrame(tick);
    }, SETTLE_MS);

    return () => {
      if (settle !== null) clearTimeout(settle);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);
}
