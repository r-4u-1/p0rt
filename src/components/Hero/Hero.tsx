import type { HeroContent, ProfileContent } from '@/types/content';
import { Icon } from '@/components/Icon';
import { useScrollScene } from '@/hooks/useScrollScene';
import styles from './Hero.module.css';

export interface HeroProps {
  readonly profile: ProfileContent;
  readonly content: HeroContent;
}

/**
 * Landing view, played as a pinned scene. The section is taller than the
 * viewport; the stage inside it sticks while `useScrollScene` writes scroll
 * progress to `--scene`. The stylesheet then acts the headline out — the page
 * promises "I build it, then I try to break it", so scrolling literally
 * breaks the headline: lines shear apart, the grid floor tilts over, and the
 * integrity gauge drains. Driven by plain scroll position, the scrub is
 * identical under a finger on a phone and a wheel on a desktop, and the
 * whole scene collapses to a static single screen under
 * prefers-reduced-motion because `--motion: 0` removes the runway.
 *
 * The headline arrives as an array of lines rather than one string the
 * component breaks up: where a line ends is a writing decision, and it is
 * not the same decision in every language.
 */
export function Hero({ profile, content }: HeroProps) {
  const sceneRef = useScrollScene<HTMLElement>();
  const watermark = profile.name.split(' ')[0];

  return (
    <section
      id="home"
      ref={sceneRef}
      className={styles.scene}
      data-surface="ink"
      aria-labelledby="hero-heading"
    >
      <div className={styles.stage}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.floor} />
          <div className={styles.glow} />
          <div className={styles.alarm} />
          <span className={styles.watermark}>{watermark}</span>
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>
            <span className={styles.kickerName}>{profile.name}</span>
            <span className={styles.kickerRole}>{profile.roleLine}</span>
          </p>

          <h1 id="hero-heading" className={styles.headline}>
            {content.headline.map((line, index) => (
              <span
                key={line}
                className={styles.lineMask}
                style={{ '--line-index': index } as React.CSSProperties}
              >
                <span className={styles.line} data-text={line}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <dl className={styles.stats}>
            {content.stats.map((stat, index) => (
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

          <div className={styles.console}>
            <a data-ico-host className={styles.cue} href="#about">
              <span className={styles.cueLine} aria-hidden="true" />
              {content.readOn}
              <Icon name="arrowDown" size={15} className={styles.cueIcon} />
            </a>

            <div className={styles.gauge} aria-hidden="true">
              <span className={styles.gaugeLabel}>{content.gaugeLabel}</span>
              <span className={styles.gaugeTrack}>
                {/*
                  Two nested scales, because two independent things move this
                  bar and a single element can only hold one transform: the
                  outer drains with scroll, the inner charges on load. Nested
                  scaleX multiplies, so the bar reads as the product — it
                  builds to full, then scrolling takes it apart.
                */}
                <span className={styles.gaugeFill}>
                  <span className={styles.gaugeCharge} />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
