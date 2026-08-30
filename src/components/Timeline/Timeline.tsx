import { useCallback } from 'react';
import type { TimelineEntry } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { CanvasScene } from '@/components/CanvasScene';
import { createCrowsScene } from '@/art/crows';
import { useInView } from '@/hooks/useInView';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { TimelineItem } from './TimelineItem';
import styles from './Timeline.module.css';

export interface TimelineProps {
  readonly entries: readonly TimelineEntry[];
}

/**
 * Employment history over a dusk-dark sky.
 *
 * The track draws itself once the list enters view and a pulse rides down it
 * at reading pace; each entry then fades in on its own observer. A flock
 * crosses the section every time it comes back into view — a different flock
 * each time, because the factory re-seeds per run, so the second read is not
 * a replay of the first.
 */
export function Timeline({ entries }: TimelineProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });
  const progressRef = useScrollProgress<HTMLDivElement>();

  // Re-seeded on every run: direction, speeds and lanes all change, so a
  // visitor scrolling back up does not see the same birds again.
  const crows = useCallback(
    () =>
      createCrowsScene({
        seed: Math.floor(Math.random() * 1e9),
        color: 'rgba(163, 172, 189, 0.62)',
        count: 6 + Math.floor(Math.random() * 3),
      }),
    [],
  );

  return (
    <Section
      id="journey"
      eyebrow="Journey"
      title="Where I have worked"
      lead="Ten years, three job titles, one consistent interest: making it work and proving that it does."
      surface="ink"
    >
      <div ref={progressRef} className={styles.sky}>
        {/* Bleed wrapper rather than a class override on the canvas: both
            would be single-class selectors in different stylesheets, and
            which one wins would come down to bundler ordering. */}
        <div className={styles.crows} aria-hidden="true">
          <CanvasScene factory={crows} delay={500} />
        </div>

        <div ref={ref} className={styles.wrap} data-visible={inView ? 'true' : 'false'}>
          <span className={styles.track} aria-hidden="true">
            <span className={styles.pulse} />
          </span>
          <ol className={styles.list}>
            {entries.map((entry, index) => (
              <TimelineItem key={entry.id} entry={entry} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
