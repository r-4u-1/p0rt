import type { TimelineEntry } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { useInView } from '@/hooks/useInView';
import { TimelineItem } from './TimelineItem';
import styles from './Timeline.module.css';

export interface TimelineProps {
  readonly entries: readonly TimelineEntry[];
}

/**
 * Employment history. The track draws itself once the list enters view;
 * each entry then fades in on its own observer.
 */
export function Timeline({ entries }: TimelineProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });

  return (
    <Section
      id="journey"
      eyebrow="Journey"
      title="Where I have worked"
      lead="Ten years, three job titles, one consistent interest: making it work and proving that it does."
      surface="ink"
    >
      <div ref={ref} className={styles.wrap} data-visible={inView ? 'true' : 'false'}>
        <span className={styles.track} aria-hidden="true" />
        <ol className={styles.list}>
          {entries.map((entry, index) => (
            <TimelineItem key={entry.id} entry={entry} index={index} />
          ))}
        </ol>
      </div>
    </Section>
  );
}
