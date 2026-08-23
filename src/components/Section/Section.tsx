import type { ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';
import styles from './Section.module.css';

export type SectionSurface = 'paper' | 'raised' | 'ink';

export interface SectionProps {
  readonly id: string;
  readonly title: string;
  /** Short kicker above the title — names the section, never a decoration. */
  readonly eyebrow: string;
  readonly lead?: string;
  readonly surface?: SectionSurface;
  readonly children: ReactNode;
}

/**
 * Layout primitive shared by every content section: consistent rhythm,
 * landmark semantics and an accessible heading association.
 */
export function Section({
  id,
  title,
  eyebrow,
  lead,
  surface = 'paper',
  children,
}: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-surface={surface === 'ink' ? 'ink' : undefined}
      className={`${styles.section} ${styles[surface]}`}
    >
      <div className={styles.inner}>
        <Reveal variant="up" className={styles.head}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
