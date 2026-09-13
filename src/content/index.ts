import type { Language, SiteContent } from '@/types/content';
import en from './en.json';
import sv from './sv.json';

/**
 * The language files, typed.
 *
 * `resolveJsonModule` widens every string in a JSON file to `string`, so a
 * literal union like `Proficiency` cannot survive the import and the cast is
 * unavoidable. That is a real hole in the type safety, and `content.test.ts`
 * is what fills it: it walks both files and asserts every level, kind,
 * status and id is one of the values the union allows, and that the two
 * languages describe the same site. The compiler cannot check a JSON file;
 * a test can, and it fails the same build.
 */
export const content: Readonly<Record<Language, SiteContent>> = {
  en: en as unknown as SiteContent,
  sv: sv as unknown as SiteContent,
};

/** Order here is the order the language control cycles through. */
export const languages: readonly Language[] = ['en', 'sv'];

/** English is the default everywhere, including when a stored value is junk. */
export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'sv';
}

export function contentFor(language: Language): SiteContent {
  return content[language];
}

/**
 * The one the toggle would switch to. With two languages this is the whole
 * of the "next language" logic; a third would make it a real rotation, and
 * this is the only place that would have to learn about it.
 */
export function nextLanguage(language: Language): Language {
  const index = languages.indexOf(language);
  return languages[(index + 1) % languages.length] ?? DEFAULT_LANGUAGE;
}
