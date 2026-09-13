import { useSyncExternalStore } from 'react';
import { contentFor, nextLanguage } from '@/content';
import {
  getLanguage,
  getServerLanguage,
  setLanguage,
  subscribeLanguage,
  toggleLanguage,
} from '@/i18n/languagePreference';
import type { Language, SiteContent } from '@/types/content';

export interface LanguagePreference {
  readonly language: Language;
  /** Everything the page says, in the current language. */
  readonly content: SiteContent;
  /** The language the toggle would move to — the control labels itself with it. */
  readonly next: Language;
  readonly toggle: () => void;
  readonly set: (next: Language) => void;
}

/**
 * React's view of the language store.
 *
 * Only two places call this: the composition root, which hands the content
 * down as props, and the language control itself. Sections stay unaware that
 * a second language exists — they receive their words like any other prop,
 * which is what keeps them testable without a provider.
 */
export function useLanguage(): LanguagePreference {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, getServerLanguage);

  return {
    language,
    content: contentFor(language),
    next: nextLanguage(language),
    toggle: toggleLanguage,
    set: setLanguage,
  };
}
