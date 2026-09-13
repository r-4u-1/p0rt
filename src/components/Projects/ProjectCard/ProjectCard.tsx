import type { Project } from '@/types/portfolio';
import type { ProjectsContent } from '@/types/content';
import { Icon } from '@/components/Icon';
import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  readonly project: Project;
  /** Drives both the entrance stagger and the parallax lane. */
  readonly index?: number;
  /** The card's own words; the repository's own come from GitHub. */
  readonly labels: Pick<ProjectsContent, 'opensOnGitHub' | 'updated' | 'stars'>;
  /** BCP-47 tag, so the month is named in the language being read. */
  readonly locale: string;
}

const LANGUAGE_COLOUR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f0c419',
  Python: '#3d7fb0',
  Java: '#b07219',
  'C#': '#68217a',
  HTML: '#e34c26',
  CSS: '#563d7c',
};

/**
 * Parallax depth per grid column. Uneven on purpose — three equal offsets
 * would move the row as one slab, which is not parallax, just a shift.
 */
const LANE_DEPTH = [0.35, 1, 0.62] as const;

/**
 * A month and a year, named by the platform. An em dash rather than a word
 * when the date will not parse: there is nothing to translate about a value
 * GitHub should never have sent.
 */
function formatUpdated(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/** Pure presentation: give it a Project, get a card. No data fetching here. */
export function ProjectCard({ project, index = 0, labels, locale }: ProjectCardProps) {
  return (
    <li
      data-project-card
      data-ico-host
      className={styles.card}
      style={
        {
          '--card-index': index,
          /* Column position in the widest grid, so neighbouring cards drift
             at different rates instead of moving as one slab. */
          '--lane-depth': LANE_DEPTH[index % LANE_DEPTH.length],
        } as React.CSSProperties
      }
    >
      <span className={styles.spot} aria-hidden="true" />

      <h3 className={styles.name}>
        <a className={styles.link} href={project.url} rel="noreferrer noopener" target="_blank">
          {project.name}
          <span className={styles.srOnly}> {labels.opensOnGitHub}</span>
        </a>
      </h3>

      <Icon name="arrowUpRight" size={17} motion="nudge" className={styles.open} />

      <p className={styles.description}>{project.description}</p>

      {project.topics.length > 0 ? (
        <ul className={styles.topics}>
          {project.topics.slice(0, 4).map((topic) => (
            <li key={topic} className={styles.topic}>
              {topic}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.meta}>
        {project.language ? (
          <span className={styles.metaItem}>
            <span
              className={styles.dot}
              style={{ background: LANGUAGE_COLOUR[project.language] ?? '#8c94a4' }}
              aria-hidden="true"
            />
            {project.language}
          </span>
        ) : null}
        <span className={styles.metaItem}>
          <Icon name="star" size={14} className={styles.metaIcon} />
          {project.stars} {project.stars === 1 ? labels.stars.one : labels.stars.other}
        </span>
        <span className={styles.metaItem}>
          {labels.updated} {formatUpdated(project.updatedAt, locale)}
        </span>
      </div>
    </li>
  );
}
