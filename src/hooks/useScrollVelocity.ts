import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Scroll rate, in px/frame, that counts as "flat out". */
const REFERENCE_SPEED = 55;
/** How much of the previous reading survives each frame. */
const SMOOTHING = 0.82;
/** Below this the page is effectively still; stop writing and idle. */
const REST = 0.012;
/** Custom-property writes on :root invalidate widely — only write real changes. */
const WRITE_EPSILON = 0.02;

/**
 * Publishes how fast the page is being scrolled, as `--velocity` (0 → 1) and
 * `--velocity-signed` (-1 → 1) on the document element.
 *
 * Every other effect on this page reads scroll *position*, which means a
 * flick and a slow drag through the same pixels look identical. Velocity is
 * the missing axis: it is what lets type stretch under acceleration and the
 * spine's charge trail lengthen when you throw the page, and it costs one
 * measurement shared by all of them rather than one listener each.
 *
 * Two things keep it cheap. It writes to `:root`, where a custom property
 * change invalidates anything that reads it, so it writes only when the
 * value has actually moved by a perceptible amount and stops entirely once
 * the page comes to rest — an idle page performs no work at all. And the
 * reading is smoothed rather than raw, because an unfiltered per-frame delta
 * is noise, and noise driving a transform is a flicker.
 */
export function useScrollVelocity(): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;

    if (reducedMotion) {
      root.style.setProperty('--velocity', '0');
      root.style.setProperty('--velocity-signed', '0');
      return;
    }

    let previousY = window.scrollY;
    let smoothed = 0;
    let signed = 0;
    let written = -1;
    let frame: number | null = null;

    const write = () => {
      // Rounded to hundredths: below that nothing on the page can show it,
      // and every write costs a style invalidation.
      const value = Math.round(smoothed * 100) / 100;
      if (Math.abs(value - written) < WRITE_EPSILON) return;
      written = value;
      root.style.setProperty('--velocity', value.toFixed(2));
      root.style.setProperty(
        '--velocity-signed',
        (value * Math.sign(signed || 1)).toFixed(2),
      );
    };

    const tick = () => {
      const y = window.scrollY;
      const delta = y - previousY;
      previousY = y;

      const instant = Math.min(1, Math.abs(delta) / REFERENCE_SPEED);
      if (delta !== 0) signed = delta;
      smoothed = smoothed * SMOOTHING + instant * (1 - SMOOTHING);

      if (smoothed < REST) {
        smoothed = 0;
        write();
        frame = null;
        return;
      }

      write();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame !== null) return;
      previousY = window.scrollY;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', start, { passive: true });
    return () => {
      window.removeEventListener('scroll', start);
      if (frame !== null) cancelAnimationFrame(frame);
      root.style.removeProperty('--velocity');
      root.style.removeProperty('--velocity-signed');
    };
  }, [reducedMotion]);
}
