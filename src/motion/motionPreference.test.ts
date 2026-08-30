import {
  getMotionSnapshot,
  getServerMotionSnapshot,
  initialiseMotion,
  refreshMotion,
  resetMotionForTests,
  setMotionSetting,
  subscribeMotion,
} from './motionPreference';
import { setSystemReducedMotion } from '@/test/motion';

describe('motionPreference', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-motion');
  });

  describe('resolving the answer', () => {
    it('follows the system by default', () => {
      setSystemReducedMotion(true);
      expect(getMotionSnapshot()).toEqual({ setting: 'system', reduced: true });

      setSystemReducedMotion(false);
      expect(getMotionSnapshot()).toEqual({ setting: 'system', reduced: false });
    });

    it('lets a visitor stop a page the system was happy to let move', () => {
      setSystemReducedMotion(false);

      setMotionSetting('off');

      expect(getMotionSnapshot().reduced).toBe(true);
    });

    it('lets a visitor start a page the system had stopped', () => {
      setSystemReducedMotion(true);

      setMotionSetting('on');

      expect(getMotionSnapshot().reduced).toBe(false);
    });

    it('returns to following the system when the choice is cleared', () => {
      setSystemReducedMotion(true);
      setMotionSetting('on');

      setMotionSetting('system');

      expect(getMotionSnapshot()).toEqual({ setting: 'system', reduced: true });
    });
  });

  describe('the document attribute', () => {
    it('mirrors the resolved answer so the stylesheet can key off it', () => {
      setSystemReducedMotion(false);
      setMotionSetting('off');
      expect(document.documentElement.dataset.motion).toBe('off');

      setMotionSetting('on');
      expect(document.documentElement.dataset.motion).toBe('on');
    });

    it('is written before React mounts, so a stored choice never flashes', () => {
      setSystemReducedMotion(false);
      localStorage.setItem('portfolio:motion', 'off');
      refreshMotion();
      document.documentElement.removeAttribute('data-motion');

      initialiseMotion();

      expect(document.documentElement.dataset.motion).toBe('off');
    });
  });

  describe('persistence', () => {
    it('remembers the choice across visits', () => {
      setSystemReducedMotion(false);

      setMotionSetting('off');

      expect(localStorage.getItem('portfolio:motion')).toBe('off');
    });

    it('forgets it again when the visitor goes back to following the system', () => {
      setMotionSetting('off');

      setMotionSetting('system');

      expect(localStorage.getItem('portfolio:motion')).toBeNull();
    });

    it('reads a stored choice back on the next visit', () => {
      setSystemReducedMotion(false);
      localStorage.setItem('portfolio:motion', 'off');

      refreshMotion();

      expect(getMotionSnapshot()).toEqual({ setting: 'off', reduced: true });
    });

    it('still applies the choice for this visit when storage refuses the write', () => {
      setSystemReducedMotion(false);
      const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      try {
        expect(() => setMotionSetting('off')).not.toThrow();
        expect(getMotionSnapshot().reduced).toBe(true);
      } finally {
        setItem.mockRestore();
      }
    });

    it('ignores a stored value it does not recognise', () => {
      setSystemReducedMotion(false);
      localStorage.setItem('portfolio:motion', 'sometimes');

      refreshMotion();

      expect(getMotionSnapshot().setting).toBe('system');
    });
  });

  describe('subscribers', () => {
    it('notifies on a change', () => {
      setSystemReducedMotion(false);
      const listener = jest.fn();
      const unsubscribe = subscribeMotion(listener);

      setMotionSetting('off');

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it('stays quiet when nothing actually changed', () => {
      setSystemReducedMotion(false);
      setMotionSetting('off');
      const listener = jest.fn();
      const unsubscribe = subscribeMotion(listener);

      setMotionSetting('off');

      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('stops notifying once unsubscribed', () => {
      setSystemReducedMotion(false);
      const listener = jest.fn();
      subscribeMotion(listener)();

      setMotionSetting('off');

      expect(listener).not.toHaveBeenCalled();
    });

    /*
     * useSyncExternalStore compares snapshots by identity and re-renders on
     * every new object. A getSnapshot that built one per call would loop.
     */
    it('hands back the same snapshot object until something changes', () => {
      setSystemReducedMotion(false);

      expect(getMotionSnapshot()).toBe(getMotionSnapshot());
    });

    it('has a stable server snapshot for the same reason', () => {
      expect(getServerMotionSnapshot()).toBe(getServerMotionSnapshot());
    });
  });

  describe('a hostile environment', () => {
    it('assumes motion is fine when there is no matchMedia at all', () => {
      const matchMedia = window.matchMedia;
      // @ts-expect-error deliberately removing the API
      delete window.matchMedia;

      try {
        resetMotionForTests();
        expect(getMotionSnapshot().reduced).toBe(false);
      } finally {
        window.matchMedia = matchMedia;
      }
    });

    it('falls back to following the system when storage cannot be read', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      try {
        expect(() => refreshMotion()).not.toThrow();
        expect(getMotionSnapshot().setting).toBe('system');
      } finally {
        getItem.mockRestore();
      }
    });
  });
});
