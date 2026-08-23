import { useCallback, useEffect, useState } from 'react';
import { useRafCallback } from './useRafCallback';

/**
 * The reading line, as a fraction of the viewport. `useActiveSection` treats
 * the band from 15% to 55% as "being read", so a section takes over around
 * the midpoint of that band. Measuring against the same line is what makes
 * the spine's fill arrive at a marker as that marker lights up.
 */
const READING_LINE = 0.35;

/**
 * Reading progress in *section space*: 0 when the first section reaches the
 * reading line, 1 at the last, and one even step per section in between.
 *
 * The spine spaces its markers evenly along the rail, so a raw
 * scrollY/scrollHeight fraction can never agree with them — sections differ
 * in height, and the pinned hero adds screens of scrolling before the first
 * one arrives, which carries the fill a fifth of the way down the rail
 * before the first section is anywhere near being read. Interpolating
 * between the sections themselves puts the fill and the markers on one
 * scale by construction, whatever the page grows into later.
 */
export function useSectionProgress(ids: readonly string[]): number {
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    const steps = ids.length - 1;
    if (steps < 1) {
      setProgress(0);
      return;
    }

    const line = window.scrollY + window.innerHeight * READING_LINE;
    const tops = ids.map((id) => {
      const node = document.getElementById(id);
      return node ? node.getBoundingClientRect().top + window.scrollY : Number.NaN;
    });

    // Walk back to the last section the reading line has reached, then
    // interpolate across the gap to the one after it.
    let value = 0;
    for (let index = steps; index >= 0; index -= 1) {
      const top = tops[index] as number;
      if (Number.isNaN(top) || line < top) continue;

      const next = index < steps ? (tops[index + 1] as number) : Number.NaN;
      value =
        !Number.isNaN(next) && next > top
          ? (index + (line - top) / (next - top)) / steps
          : index / steps;
      break;
    }

    setProgress(Math.min(1, Math.max(0, value)));
  }, [ids]);

  const onScroll = useRafCallback(measure);

  useEffect(() => {
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measure, onScroll]);

  return progress;
}
