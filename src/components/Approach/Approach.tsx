import type { ApproachContent } from '@/types/content';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import styles from './Approach.module.css';

export interface ApproachProps {
  readonly content: ApproachContent;
}

/** What it is actually like to work with me — the part a CV cannot carry. */
export function Approach({ content }: ApproachProps) {
  return (
    <Section
      id="approach"
      eyebrow={content.eyebrow}
      title={content.title}
      lead={content.lead}
      surface="raised"
    >
      <ul className={styles.list}>
        {content.principles.map((principle, index) => (
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
