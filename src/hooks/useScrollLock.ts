import { useEffect } from 'react';

/** Stops the page scrolling behind the open mobile menu. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previous = body.dataset['scrollLocked'];
    body.dataset['scrollLocked'] = 'true';
    return () => {
      if (previous) body.dataset['scrollLocked'] = previous;
      else delete body.dataset['scrollLocked'];
    };
  }, [locked]);
}
