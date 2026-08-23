import styles from './SkipLink.module.css';

export interface SkipLinkProps {
  readonly targetId: string;
  readonly label?: string;
}

/** First tab stop on the page. Visible only when focused. */
export function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a className={styles.skip} href={`#${targetId}`}>
      {label}
    </a>
  );
}
