import type { Project } from '@/types/portfolio';
import type { ProjectQuery, ProjectSource } from '@/services/projectSource';

/**
 * Test double honouring the same contract as the real sources — proof the
 * UI depends on the abstraction and not on GitHub.
 */
export class FakeProjectSource implements ProjectSource {
  readonly id = 'fake';
  calls = 0;

  constructor(
    private readonly projects: readonly Project[],
    private readonly failWith?: Error,
  ) {}

  async list(query: ProjectQuery = {}): Promise<readonly Project[]> {
    this.calls += 1;
    if (this.failWith) throw this.failWith;
    return typeof query.limit === 'number' ? this.projects.slice(0, query.limit) : this.projects;
  }
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'example-repo',
    description: 'An example repository.',
    url: 'https://github.com/example/example-repo',
    language: 'TypeScript',
    stars: 3,
    topics: ['testing'],
    updatedAt: '2026-03-01T12:00:00Z',
    ...overrides,
  };
}
