import type { Language, UiContent } from '@/types/content';
import { useLanguage } from '@/hooks/useLanguage';
import { languages } from '@/content';
import styles from './LanguageToggle.module.css';

export interface LanguageToggleProps {
  readonly labels: UiContent['language'];
  readonly className?: string;
}

/** The two-letter code a reader recognises, rather than a flag. */
const CODE: Record<Language, string> = {
  en: 'EN',
  sv: 'SV',
};

/**
 * Switches the page between English and Swedish, and remembers the choice.
 *
 * A flag is the usual shorthand and the wrong one — a language is not a
 * country, and the Swedish flag is not what a Finland-Swedish speaker or a
 * Norwegian reader is looking for. Two codes with the active one lit says
 * the same thing without the geography.
 *
 * Both codes are shown rather than only the one you would switch to. A lone
 * code is genuinely ambiguous — it can mean "you are reading this" or "press
 * for this", and half of all visitors read it the wrong way round. With the
 * pair on screen the state and the destination are both visible.
 *
 * The accessible name is the sentence in the *target* language, carried by a
 * real element so it can be marked with `lang`: a screen reader then
 * announces "Byt till svenska" in a Swedish voice rather than sounding it
 * out in English. That is the one convention a language switcher genuinely
 * has, and an `aria-label` cannot express it — an attribute has no language
 * of its own.
 */
export function LanguageToggle({ labels, className }: LanguageToggleProps) {
  const { language, next, toggle } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      className={[styles.button, className].filter(Boolean).join(' ')}
      title={labels.switchTo}
      data-testid="language-toggle"
    >
      <span className={styles.codes} aria-hidden="true">
        {languages.map((code) => (
          <span
            key={code}
            className={styles.code}
            data-active={code === language ? 'true' : 'false'}
          >
            {CODE[code]}
          </span>
        ))}
      </span>

      <span className={styles.name} lang={next}>
        {labels.switchTo}
      </span>

      {/* The word beside the codes, matching the motion switch next to it.
          Decorative: the button is already named by the sentence above. */}
      <span className={styles.label} aria-hidden="true">
        {labels.label}
      </span>
    </button>
  );
}
