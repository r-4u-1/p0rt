import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { useProjects } from '@/hooks/useProjects';
import { useServices } from '@/services/ServicesContext';
import { ProjectCard } from './ProjectCard';
import styles from './Projects.module.css';

export interface ProjectsProps {
  readonly githubUser: string;
  readonly limit?: number;
}

/**
 * Container component. It wires a data source to presentation and owns
 * nothing else — the cards stay pure, and swapping GitHub for another
 * source means changing the provider, not this file.
 */
export function Projects({ githubUser, limit = 6 }: ProjectsProps) {
  const { projectSource, fallbackSource } = useServices();
  const { status, projects, message } = useProjects(projectSource, fallbackSource, limit);

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Live from GitHub"
      lead="Pulled from the public API when the page loads, sorted by stars then recency. If GitHub is unreachable you get a saved selection instead."
      surface="paper"
    >
      <div
        className={styles.status}
        role="status"
        aria-live="polite"
        data-testid="projects-status"
      >
        {status === 'loading' ? 'Loading repositories from GitHub…' : null}
        {status === 'ready' ? `${projects.length} public repositories` : null}
        {status === 'fallback' && message ? message : null}
        {status === 'error' ? message ?? 'Could not load repositories.' : null}
      </div>

      {status === 'loading' ? (
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: limit }, (_, index) => (
            <li key={index} className={styles.skeleton} data-testid="project-skeleton" />
          ))}
        </ul>
      ) : null}

      {projects.length > 0 ? (
        <Reveal as="ul" variant="up" className={styles.grid}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </Reveal>
      ) : null}

      {status === 'error' ? (
        <p className={styles.fallbackNote}>
          You can still browse everything at{' '}
          <a href={`https://github.com/${githubUser}`} rel="noreferrer noopener" target="_blank">
            github.com/{githubUser}
          </a>
          .
        </p>
      ) : null}

      <Reveal variant="fade" delay={140}>
        <a
          className={styles.moreLink}
          href={`https://github.com/${githubUser}?tab=repositories`}
          rel="noreferrer noopener"
          target="_blank"
        >
          All repositories on GitHub
          <span aria-hidden="true">→</span>
        </a>
      </Reveal>
    </Section>
  );
}
