import { useParallax } from '@/hooks/useParallax';
import styles from './Hero.module.css';

export interface HeroStat {
  readonly label: string;
  readonly value: string;
}

export interface HeroProps {
  readonly name: string;
  readonly roleLine: string;
  readonly headline: readonly string[];
  readonly stats: readonly HeroStat[];
}

/**
 * Landing view. Two independently parallaxed layers — backdrop and content —
 * driven by plain scroll position, so the effect is identical under a finger
 * on a phone and a wheel on a desktop. Both collapse to static under
 * prefers-reduced-motion because `useParallax` stops writing the variables.
 */
export function Hero({ name, roleLine, headline, stats }: HeroProps) {
  const backdropRef = useParallax<HTMLDivElement>(0.32);
  const contentRef = useParallax<HTMLDivElement>(0.12);

  return (
    <section id="home" className={styles.hero} data-surface="ink" aria-labelledby="hero-heading">
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.glow} />
        <svg className={styles.wave} viewBox="0 0 1200 300" preserveAspectRatio="none" focusable="false">
          <path
            d="M0 190 Q 120 120 240 190 T 480 190 T 720 190 T 960 190 T 1200 190"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M0 220 Q 150 170 300 220 T 600 220 T 900 220 T 1200 220"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
          />
        </svg>
      </div>

      <div ref={contentRef} className={styles.content}>
        <p className={styles.kicker}>
          <span className={styles.kickerName}>{name}</span>
          <span className={styles.kickerRole}>{roleLine}</span>
        </p>

        <h1 id="hero-heading" className={styles.headline}>
          {headline.map((line, index) => (
            <span key={line} className={styles.lineMask}>
              <span
                className={styles.line}
                style={{ '--line-index': index } as React.CSSProperties}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <dl className={styles.stats}>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={styles.stat}
              style={{ '--stat-index': index } as React.CSSProperties}
            >
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <a className={styles.cue} href="#about">
          <span className={styles.cueLine} aria-hidden="true" />
          Read on
        </a>
      </div>
    </section>
  );
}
