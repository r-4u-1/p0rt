import type { Profile } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import styles from './About.module.css';

export interface AboutProps {
  readonly profile: Profile;
}

/** Presentation only — receives the profile, never imports it. */
export function About({ profile }: AboutProps) {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="Three seats, one product"
      lead="Developer, test automation engineer, scrum master. The same product seen from three angles, which turns out to be the useful part."
      surface="paper"
    >
      <div className={styles.layout}>
        <div className={styles.prose}>
          {profile.intro.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} variant="up" delay={index * 90}>
              <p className={styles.paragraph}>{paragraph}</p>
            </Reveal>
          ))}
        </div>

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
    </Section>
  );
}
