import { useCallback } from 'react';
import type { ExploreTopic } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { CanvasScene } from '@/components/CanvasScene';
import { createTelemetryRainScene } from '@/art/telemetryRain';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './Exploring.module.css';

export interface ExploringProps {
  readonly topics: readonly ExploreTopic[];
}

const STATUS_LABEL: Record<ExploreTopic['status'], string> = {
  building: 'Building something',
  reading: 'Reading and testing',
  next: 'Up next',
};

const STATUS_ICON: Record<ExploreTopic['status'], IconName> = {
  building: 'pulse',
  reading: 'book',
  next: 'compass',
};

const STATUS_MOTION = {
  building: 'pulse',
  reading: 'trace',
  next: 'spin',
} as const;

/**
 * The honest "not yet, but soon" list. Employers ask; this answers.
 *
 * It runs on the dark surface and the code falls behind it, because this is
 * the section about models, retrieval and evaluation — the one place on the
 * page where a stream of glyphs is the subject rather than a decoration.
 * The glyph set is hex, operators and assertion marks rather than katakana,
 * for the same reason: it should look like this page's output, not like a
 * film's.
 */
export function Exploring({ topics }: ExploringProps) {
  const driftRef = useScrollProgress<HTMLDivElement>();
  const rain = useCallback(
    () => createTelemetryRainScene({ seed: Math.floor(Math.random() * 1e9) }),
    [],
  );

  return (
    <Section
      id="exploring"
      eyebrow="Exploring"
      title="What I am learning next"
      lead="I would rather show you the edge of what I know than pretend it is not there. These are the six things currently taking up my evenings."
      surface="ink"
    >
      <div ref={driftRef} className={styles.field}>
        <div className={styles.rain} aria-hidden="true">
          <CanvasScene factory={rain} delay={250} />
        </div>

        <ul className={styles.grid}>
          {topics.map((topic, index) => (
            <Reveal
              as="li"
              key={topic.id}
              variant="up"
              delay={index * 60}
              className={styles.card}
              icoHost
              style={{ '--card-index': index } as React.CSSProperties}
            >
              <span className={styles.status} data-status={topic.status}>
                <Icon
                  name={STATUS_ICON[topic.status]}
                  size={14}
                  motion={STATUS_MOTION[topic.status]}
                />
                {STATUS_LABEL[topic.status]}
              </span>
              <h3 className={styles.title}>{topic.title}</h3>
              <p className={styles.why}>{topic.why}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
