import type { RoleKind, TimelineEntry } from '@/types/portfolio';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './TimelineItem.module.css';

export interface TimelineItemProps {
  readonly entry: TimelineEntry;
  readonly index: number;
}

const KIND_LABEL: Record<RoleKind, string> = {
  development: 'Development',
  quality: 'Quality engineering',
  leadership: 'Team facilitation',
  education: 'Education',
};

/**
 * One employment entry. Observes itself so long timelines only animate the
 * rows a visitor actually reaches — cheaper on mobile than one big observer
 * plus per-row delays.
 */
export function TimelineItem({ entry, index }: TimelineItemProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLLIElement>({ threshold: 0.25 });
  const visible = reducedMotion || inView;
  const period = `${entry.start} – ${entry.end ?? 'present'}`;

  return (
    <li
      ref={ref}
      className={styles.item}
      data-visible={visible ? 'true' : 'false'}
      data-kind={entry.kind}
      data-testid="timeline-item"
      style={{ '--item-index': index } as React.CSSProperties}
    >
      <span className={styles.marker} aria-hidden="true">
        <span className={styles.dot} />
      </span>

      <article className={styles.card}>
        <p className={styles.period}>
          <time dateTime={entry.start}>{period}</time>
          <span className={styles.kind}>{KIND_LABEL[entry.kind]}</span>
        </p>

        <h3 className={styles.role}>{entry.role}</h3>
        <p className={styles.org}>{entry.organisation}</p>
        <p className={styles.summary}>{entry.summary}</p>

        <ul className={styles.highlights}>
          {entry.highlights.map((highlight) => (
            <li key={highlight} className={styles.highlight}>
              {highlight}
            </li>
          ))}
        </ul>

        <ul className={styles.stack} aria-label={`Tools used as ${entry.role}`}>
          {entry.stack.map((tool) => (
            <li key={tool} className={styles.tool}>
              {tool}
            </li>
          ))}
        </ul>
      </article>
    </li>
  );
}
