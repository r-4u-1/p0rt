import type { Project } from '@/types/portfolio';
import type { ProjectQuery, ProjectSource } from './projectSource';

/**
 * Substitutable stand-in for the GitHub source (Liskov): same contract, no
 * network. Used as the offline fallback and by the visual-regression build.
 */
export class StaticProjectSource implements ProjectSource {
  readonly id = 'static';

  constructor(private readonly projects: readonly Project[]) {}

  async list(query: ProjectQuery = {}): Promise<readonly Project[]> {
    return typeof query.limit === 'number'
      ? this.projects.slice(0, query.limit)
      : this.projects;
  }
}
