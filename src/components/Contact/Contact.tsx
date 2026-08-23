import type { Profile } from '@/types/portfolio';
import { Reveal } from '@/components/Reveal';
import styles from './Contact.module.css';

export interface ContactProps {
  readonly profile: Profile;
}

/** Footer and contact details in one landmark — the last thing a recruiter reads. */
export function Contact({ profile }: ContactProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className={styles.footer} data-surface="ink" aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <Reveal variant="up">
          <p className={styles.eyebrow}>Contact</p>
          <h2 id="contact-heading" className={styles.headline}>
            Hiring, or just curious? Write to me.
          </h2>
          <p className={styles.lead}>
            {profile.availability} · {profile.location}. I reply to everything that is not a
            recruitment bot, usually within a day.
          </p>
        </Reveal>

        <Reveal as="ul" variant="up" delay={120} className={styles.channels}>
          {profile.channels.map((channel, index) => (
            <li
              key={channel.id}
              className={styles.channel}
              style={{ '--channel-index': index } as React.CSSProperties}
            >
              <a className={styles.channelLink} href={channel.href} rel="noreferrer noopener">
                <span className={styles.channelLabel}>{channel.label}</span>
                <span className={styles.channelValue}>{channel.value}</span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </Reveal>

        <div className={styles.colophon}>
          <p className={styles.built}>
            Built with React, TypeScript and CSS Modules. Tested with Jest, Testing Library,
            Playwright and Percy. Deployed from GitHub Actions to GitHub Pages.
          </p>
          <div className={styles.bottomRow}>
            <p className={styles.copy}>
              © {year} {profile.name}
            </p>
            <a className={styles.top} href="#home">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
