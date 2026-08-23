import type { ExploreTopic } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import styles from './Exploring.module.css';

export interface ExploringProps {
  readonly topics: readonly ExploreTopic[];
}

const STATUS_LABEL: Record<ExploreTopic['status'], string> = {
  building: 'Building something',
  reading: 'Reading and testing',
  next: 'Up next',
};

/** The honest "not yet, but soon" list. Employers ask; this answers. */
export function Exploring({ topics }: ExploringProps) {
  return (
    <Section
      id="exploring"
      eyebrow="Exploring"
      title="What I am learning next"
      lead="I would rather show you the edge of what I know than pretend it is not there. These are the six things currently taking up my evenings."
      surface="paper"
    >
      <ul className={styles.grid}>
        {topics.map((topic, index) => (
          <Reveal
            as="li"
            key={topic.id}
            variant="up"
            delay={index * 60}
            className={styles.card}
          >
            <span className={styles.status} data-status={topic.status}>
              {STATUS_LABEL[topic.status]}
            </span>
            <h3 className={styles.title}>{topic.title}</h3>
            <p className={styles.why}>{topic.why}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
