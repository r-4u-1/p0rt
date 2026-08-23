import { useCallback, useEffect, useRef } from 'react';

/**
 * Coalesces high-frequency events (scroll, resize) into one call per frame.
 * Keeps scroll handlers off the critical path on low-powered phones.
 */
export function useRafCallback(callback: () => void): () => void {
  const frame = useRef<number | null>(null);
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      latest.current();
    });
  }, []);
}
