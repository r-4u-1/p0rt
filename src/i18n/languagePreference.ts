import { DEFAULT_LANGUAGE, contentFor, isLanguage, nextLanguage } from '@/content';
import type { Language } from '@/types/content';

/**
 * One source of truth for "which language is this page in?".
 *
 * Built the same way as the motion store, and for the same reasons: the
 * answer is genuinely global, it has to survive a reload, and something
 * outside React — the `lang` attribute, the document title — has to be kept
 * in step with it. `useSyncExternalStore` reads it without a provider.
 *
 * The snapshot is a plain string rather than an object, so identity
 * comparison is value comparison and there is no cached-object trap to fall
 * into.
 *
 * English is the default. Not `navigator.language`: a portfolio read by a
 * recruiter on a Swedish machine is still, first, an application written in
 * the language the site was written in, and a visitor who wants the other
 * one is one button away. Guessing would also mean the first paint and the
 * stored choice could disagree on a shared computer.
 */

const STORAGE_KEY = 'portfolio:language';

const listeners = new Set<() => void>();

function readStoredLanguage(): Language {
  if (typeof localStorage === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    // Private mode, disabled storage, or a blocked third-party context.
    return DEFAULT_LANGUAGE;
  }
}

let language: Language = readStoredLanguage();

/**
 * Mirrors the choice onto the document.
 *
 * `lang` is not decoration: it tells a screen reader which voice to use and
 * a browser which hyphenation and quotation rules apply. Getting it wrong is
 * the difference between a Swedish paragraph read in Swedish and the same
 * paragraph read by an English voice, one syllable at a time.
 *
 * The title and description travel with it, because a bookmark, a tab strip
 * and a shared link are all the page speaking too.
 */
function syncDocument(): void {
  if (typeof document === 'undefined') return;
  const { meta } = contentFor(language);

  document.documentElement.lang = language;
  document.title = meta.documentTitle;

  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute('content', meta.documentDescription);
}

function publish(next: Language): void {
  if (next === language) return;
  language = next;
  syncDocument();
  for (const listener of listeners) listener();
}

export function getLanguage(): Language {
  return language;
}

/** Stable, so it is safe as a `getServerSnapshot`. */
export function getServerLanguage(): Language {
  return DEFAULT_LANGUAGE;
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLanguage(next: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // A rejected write must not stop the choice applying for this visit.
  }
  publish(next);
}

/** Moves to the next language in the list and remembers it. */
export function toggleLanguage(): void {
  setLanguage(nextLanguage(language));
}

/**
 * Applies the stored answer to the document before React mounts, so the
 * first paint, the tab title and the `lang` attribute agree with each other
 * rather than flipping a frame later.
 */
export function initialiseLanguage(): void {
  language = readStoredLanguage();
  syncDocument();
}

/** Test seam: forgets the visitor's choice and returns to the default. */
export function resetLanguageForTests(): void {
  language = DEFAULT_LANGUAGE;
  for (const listener of listeners) listener();
}
