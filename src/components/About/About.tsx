import type { AboutContent, ProfileContent } from '@/types/content';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './About.module.css';

export interface AboutProps {
  readonly profile: ProfileContent;
  readonly content: AboutContent;
}

/**
 * Presentation only — receives its words, never imports them.
 *
 * The two columns counter-scroll: `useScrollProgress` writes `--drift`
 * (-1 → 0 → 1 as the layout crosses the viewport) and the stylesheet moves
 * the prose and the facts card in opposite directions from that one number.
 * Horizontal separation is the point — the section is literally two accounts
 * of the same person pulling apart as you read them.
 */
export function About({ profile, content }: AboutProps) {
  const driftRef = useScrollProgress<HTMLDivElement>();

  return (
    <Section
      id="about"
      eyebrow={content.eyebrow}
      title={content.title}
      lead={content.lead}
      surface="paper"
    >
      <div ref={driftRef} className={styles.layout}>
        <div className={styles.prose}>
          {content.intro.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} variant="up" delay={index * 90}>
              <p className={styles.paragraph}>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        {/* Two elements, two jobs: the wrapper carries the scroll drift, the
            Reveal carries the entrance. Stacking both transforms on one node
            means whichever stylesheet loads last silently wins. */}
        <div className={styles.cardDrift}>
          <Reveal variant="right" delay={120} className={styles.card}>
            <h3 className={styles.cardTitle}>{content.factsTitle}</h3>
            <dl className={styles.facts}>
              {content.facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.availability}>
              <span className={styles.pip} aria-hidden="true" />
              {profile.availability}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
