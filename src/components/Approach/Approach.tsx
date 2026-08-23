import type { Principle } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import styles from './Approach.module.css';

export interface ApproachProps {
  readonly principles: readonly Principle[];
}

/** What it is actually like to work with me — the part a CV cannot carry. */
export function Approach({ principles }: ApproachProps) {
  return (
    <Section
      id="approach"
      eyebrow="Approach"
      title="How I work"
      lead="Five things I will bring to your team on day one, whichever of the three seats you put me in."
      surface="raised"
    >
      <ul className={styles.list}>
        {principles.map((principle, index) => (
          <Reveal
            as="li"
            key={principle.id}
            variant="left"
            delay={index * 70}
            className={styles.item}
          >
            <h3 className={styles.title}>{principle.title}</h3>
            <p className={styles.body}>{principle.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
