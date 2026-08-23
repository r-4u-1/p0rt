import { useCallback, useEffect, useState } from 'react';
import { useRafCallback } from './useRafCallback';

/** Document scroll position as 0 → 1. Drives the progress spine. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
  }, []);

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
