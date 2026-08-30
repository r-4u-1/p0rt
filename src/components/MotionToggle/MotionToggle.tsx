import { useMotionPreference } from '@/hooks/useMotionPreference';
import styles from './MotionToggle.module.css';

export interface MotionToggleProps {
  readonly className?: string;
}

/**
 * Hands the visitor the page's motion switch.
 *
 * `prefers-reduced-motion` is a default, not a verdict — it cannot express
 * "my OS is set to reduce but show me what this does", and it cannot be
 * changed from inside the page by someone who finds the motion too much
 * halfway down. Both are one button away, and the button remembers.
 *
 * The indicator is the state rather than a picture of it: three bars that
 * actually move while motion is on and sit flat when it is off. Nothing to
 * keep in sync, and it demonstrates what the control does before you press
 * it. `aria-pressed` carries the same fact to assistive technology.
 */
export function MotionToggle({ className }: MotionToggleProps) {
  const { reduced, toggle } = useMotionPreference();

  return (
    <button
      type="button"
      onClick={toggle}
      className={[styles.button, className].filter(Boolean).join(' ')}
      aria-pressed={!reduced}
      data-testid="motion-toggle"
      title={reduced ? 'Turn page animation on' : 'Turn page animation off'}
    >
      <span className={styles.meter} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </span>
      <span className={styles.label}>Motion</span>
    </button>
  );
}
