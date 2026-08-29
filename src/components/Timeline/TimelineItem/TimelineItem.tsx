import type { RoleKind, TimelineEntry } from '@/types/portfolio';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
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
 * The marker carries the kind. A coloured dot needed a legend; a terminal,
 * a shield, two figures and a mortarboard do not — and the colour stays,
 * so the two readings reinforce each other rather than duplicating.
 */
const KIND_ICON: Record<RoleKind, IconName> = {
  development: 'terminal',
  quality: 'shieldCheck',
  leadership: 'users',
  education: 'cap',
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
      data-ico-host
      className={styles.item}
      data-visible={visible ? 'true' : 'false'}
      data-kind={entry.kind}
      data-testid="timeline-item"
      style={{ '--item-index': index } as React.CSSProperties}
    >
      <span className={styles.marker} aria-hidden="true">
        <Icon name={KIND_ICON[entry.kind]} size={14} className={styles.markerIcon} />
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
          {entry.stack.map((tool, toolIndex) => (
            <li
              key={tool}
              className={styles.tool}
              style={{ '--tool-index': toolIndex } as React.CSSProperties}
            >
              {tool}
            </li>
          ))}
        </ul>
      </article>
    </li>
  );
}
