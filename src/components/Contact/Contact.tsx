import type { Profile } from '@/types/portfolio';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import styles from './Contact.module.css';

/**
 * Keyed by channel id, with a mail fallback — an id the site owner invents
 * ("mastodon", "cv") gets a sensible icon rather than a crash.
 */
const CHANNEL_ICON: Record<string, IconName> = {
  email: 'mail',
  github: 'github',
  linkedin: 'linkedin',
};

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
              <a
                data-ico-host
                className={styles.channelLink}
                href={channel.href}
                rel="noreferrer noopener"
              >
                <Icon
                  name={CHANNEL_ICON[channel.id] ?? 'mail'}
                  size={20}
                  motion="trace"
                  className={styles.channelIcon}
                />
                <span className={styles.channelLabel}>{channel.label}</span>
                <span className={styles.channelValue}>{channel.value}</span>
                <Icon name="arrowUpRight" size={18} motion="nudge" className={styles.arrow} />
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
            <a data-ico-host className={styles.top} href="#home">
              Back to top
              <Icon name="arrowDown" size={14} className={styles.topIcon} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
