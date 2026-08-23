import { useCallback, useEffect, useRef } from 'react';
import { useRafCallback } from './useRafCallback';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Writes the element's scroll offset to a CSS custom property instead of
 * setting `transform` from JS. The stylesheet decides what to do with it, so
 * a component can opt into translation, blur or opacity without new JS —
 * and mobile gets the same effect because it is plain scrollY maths, not a
 * hover or pointer trick.
 */
export function useParallax<T extends HTMLElement = HTMLElement>(strength = 0.2) {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const offset = window.scrollY * strength;
    node.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    // 1 at the top of the page, 0 once the hero has fully scrolled away.
    const fade = Math.max(0, 1 - window.scrollY / Math.max(1, window.innerHeight * 0.8));
    node.style.setProperty('--parallax-fade', fade.toFixed(3));
  }, [strength]);

  const onScroll = useRafCallback(update);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      node.style.setProperty('--parallax-y', '0px');
      node.style.setProperty('--parallax-fade', '1');
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
