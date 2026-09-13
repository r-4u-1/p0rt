import {
  getLanguage,
  getServerLanguage,
  initialiseLanguage,
  resetLanguageForTests,
  setLanguage,
  subscribeLanguage,
  toggleLanguage,
} from './languagePreference';
import { content } from '@/content';

describe('languagePreference', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('lang');
    resetLanguageForTests();
  });

  describe('choosing', () => {
    it('starts in English', () => {
      expect(getLanguage()).toBe('en');
      expect(getServerLanguage()).toBe('en');
    });

    it('moves to the other language and back again', () => {
      toggleLanguage();
      expect(getLanguage()).toBe('sv');

      toggleLanguage();
      expect(getLanguage()).toBe('en');
    });

    it('takes a language directly, for anything that knows which it wants', () => {
      setLanguage('sv');
      expect(getLanguage()).toBe('sv');
    });
  });

  describe('remembering', () => {
    it('survives a reload', () => {
      setLanguage('sv');

      // What `main.tsx` does on the next visit, before React mounts.
      resetLanguageForTests();
      initialiseLanguage();

      expect(getLanguage()).toBe('sv');
    });

    it('ignores a stored value it does not ship a file for', () => {
      localStorage.setItem('portfolio:language', 'de');

      initialiseLanguage();

      expect(getLanguage()).toBe('en');
    });

    /*
     * Private mode, disabled storage, a blocked third-party context: a
     * rejected write is not a reason to leave the visitor on a page in the
     * language they just asked to leave.
     */
    it('still applies the choice when storage refuses to keep it', () => {
      const setItem = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

      expect(() => setLanguage('sv')).not.toThrow();
      expect(getLanguage()).toBe('sv');

      setItem.mockRestore();
    });
  });

  /*
   * `lang` is not decoration: it decides which voice a screen reader uses.
   * The title and description travel with it, because a tab strip and a
   * shared link are the page speaking too.
   */
  describe('telling the document', () => {
    it('marks the document with the language being read', () => {
      initialiseLanguage();
      expect(document.documentElement.lang).toBe('en');

      setLanguage('sv');

      expect(document.documentElement.lang).toBe('sv');
    });

    it('retitles the tab and the description to match', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.append(meta);

      setLanguage('sv');

      expect(document.title).toBe(content.sv.meta.documentTitle);
      expect(meta.getAttribute('content')).toBe(content.sv.meta.documentDescription);

      meta.remove();
    });

    it('does not mind a page with no description to update', () => {
      expect(() => setLanguage('sv')).not.toThrow();
    });
  });

  describe('publishing', () => {
    it('tells subscribers when the language changes', () => {
      const listener = jest.fn();
      const unsubscribe = subscribeLanguage(listener);

      setLanguage('sv');

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      setLanguage('en');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('stays quiet when the language is set to what it already is', () => {
      const listener = jest.fn();
      const unsubscribe = subscribeLanguage(listener);

      setLanguage('en');

      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });
});
