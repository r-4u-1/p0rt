import type { ProjectsContent } from '@/types/content';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { useProjects } from '@/hooks/useProjects';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { usePointerSpot } from '@/hooks/usePointerSpot';
import { useServices } from '@/services/ServicesContext';
import { ProjectCard } from './ProjectCard';
import styles from './Projects.module.css';

export interface ProjectsProps {
  readonly content: ProjectsContent;
  readonly githubUser: string;
  /** BCP-47 tag for the dates on the cards. */
  readonly locale: string;
  readonly limit?: number;
}

/**
 * Container component. It wires a data source to presentation and owns
 * nothing else — the cards stay pure, and swapping GitHub for another
 * source means changing the provider, not this file.
 *
 * The status line is assembled here rather than in the hook, because it is
 * the only half of it that can be translated: the reason a request failed
 * comes from GitHub in whatever language GitHub chose, and the sentence
 * around it — "showing a saved selection instead" — is ours.
 */
export function Projects({ content, githubUser, locale, limit = 6 }: ProjectsProps) {
  const { projectSource, fallbackSource } = useServices();
  const { status, projects, message } = useProjects(projectSource, fallbackSource, limit);
  const driftRef = useScrollProgress<HTMLDivElement>();
  const spotRef = usePointerSpot<HTMLDivElement>('[data-project-card]');

  const counted = projects.length === 1 ? content.ready.one : content.ready.other;
  // Word order around the link is not the same in every language, so the
  // sentence owns the position and the component fills the hole.
  const [beforeLink, afterLink] = content.browseAt.split('{link}');

  return (
    <Section
      id="projects"
      eyebrow={content.eyebrow}
      title={content.title}
      lead={content.lead}
      surface="paper"
    >
      <div
        className={styles.status}
        role="status"
        aria-live="polite"
        data-testid="projects-status"
      >
        {status === 'loading' ? content.loading : null}
        {status === 'ready' ? `${projects.length} ${counted}` : null}
        {status === 'fallback' && message ? `${message} ${content.fallbackSuffix}` : null}
        {status === 'error' ? (message ?? content.error) : null}
      </div>

      {status === 'loading' ? (
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: limit }, (_, index) => (
            <li key={index} className={styles.skeleton} data-testid="project-skeleton" />
          ))}
        </ul>
      ) : null}

      {projects.length > 0 ? (
        <div ref={driftRef} className={styles.lanes}>
          <div ref={spotRef}>
            <Reveal as="ul" variant="up" className={styles.grid}>
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  labels={content}
                  locale={locale}
                />
              ))}
            </Reveal>
          </div>
        </div>
      ) : null}

      {status === 'error' ? (
        <p className={styles.fallbackNote}>
          {beforeLink ?? ''}
          <a href={`https://github.com/${githubUser}`} rel="noreferrer noopener" target="_blank">
            github.com/{githubUser}
          </a>
          {afterLink ?? ''}
        </p>
      ) : null}

      <Reveal variant="fade" delay={140}>
        <a
          data-ico-host
          className={styles.moreLink}
          href={`https://github.com/${githubUser}?tab=repositories`}
          rel="noreferrer noopener"
          target="_blank"
        >
          {content.allRepositories}
          <Icon name="arrowUpRight" size={16} motion="nudge" />
        </a>
      </Reveal>
    </Section>
  );
}
