import type { Profile } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './About.module.css';

export interface AboutProps {
  readonly profile: Profile;
}

/**
 * Presentation only — receives the profile, never imports it.
 *
 * The two columns counter-scroll: `useScrollProgress` writes `--drift`
 * (-1 → 0 → 1 as the layout crosses the viewport) and the stylesheet moves
 * the prose and the facts card in opposite directions from that one number.
 * Horizontal separation is the point — the section is literally two accounts
 * of the same person pulling apart as you read them.
 */
export function About({ profile }: AboutProps) {
  const driftRef = useScrollProgress<HTMLDivElement>();

  return (
    <Section
      id="about"
      eyebrow="About"
      title="Three seats, one product"
      lead="Developer, test automation engineer, scrum master. The same product seen from three angles, which turns out to be the useful part."
      surface="paper"
    >
      <div ref={driftRef} className={styles.layout}>
        <div className={styles.prose}>
          {profile.intro.map((paragraph, index) => (
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
            <h3 className={styles.cardTitle}>Quick facts</h3>
            <dl className={styles.facts}>
              {profile.facts.map((fact) => (
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
