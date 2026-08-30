import { useCallback, useSyncExternalStore } from 'react';
import {
  getMotionSnapshot,
  getServerMotionSnapshot,
  setMotionSetting,
  subscribeMotion,
} from '@/motion/motionPreference';
import type { MotionSetting, MotionSnapshot } from '@/motion/motionPreference';

export interface MotionPreference extends MotionSnapshot {
  /** Flips between playing and not, and remembers the choice. */
  readonly toggle: () => void;
  readonly set: (next: MotionSetting) => void;
}

/**
 * React's view of the motion store. Every motion hook on the page resolves
 * through here, so a visitor's choice reaches the canvases, the pinned
 * scenes and the scroll listeners in the same tick as the stylesheet.
 */
export function useMotionPreference(): MotionPreference {
  const snapshot = useSyncExternalStore(
    subscribeMotion,
    getMotionSnapshot,
    getServerMotionSnapshot,
  );

  const toggle = useCallback(() => {
    // An explicit choice, not a return to "system": the visitor just told us
    // what they want, and it should survive them changing the OS setting.
    setMotionSetting(getMotionSnapshot().reduced ? 'on' : 'off');
  }, []);

  return { ...snapshot, toggle, set: setMotionSetting };
}
