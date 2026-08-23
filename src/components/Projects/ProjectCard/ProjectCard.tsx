import type { Project } from '@/types/portfolio';
import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  readonly project: Project;
  /** Used for the stagger only. */
  readonly index?: number;
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

function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/** Pure presentation: give it a Project, get a card. No data fetching here. */
export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <li
      className={styles.card}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <h3 className={styles.name}>
        <a className={styles.link} href={project.url} rel="noreferrer noopener" target="_blank">
          {project.name}
          <span className={styles.srOnly}> (opens on GitHub in a new tab)</span>
        </a>
      </h3>

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
          {project.stars} {project.stars === 1 ? 'star' : 'stars'}
        </span>
        <span className={styles.metaItem}>Updated {formatUpdated(project.updatedAt)}</span>
      </div>
    </li>
  );
}
