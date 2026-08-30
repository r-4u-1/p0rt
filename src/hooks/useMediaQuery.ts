import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reads a media query from React, for the cases CSS cannot handle alone.
 *
 * Used sparingly and only where a *behavioural* difference depends on the
 * breakpoint — the Stack rail is keyboard-scrollable in one layout and not
 * in the other, and `tabindex` is markup, not style. Anything purely visual
 * stays in the stylesheet where it belongs.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const list = window.matchMedia(query);
      if (list.addEventListener) {
        list.addEventListener('change', onChange);
        return () => list.removeEventListener('change', onChange);
      }
      // Safari < 14
      list.addListener(onChange);
      return () => list.removeListener(onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
