import type { Project } from '@/types/portfolio';
import type { ProjectQuery, ProjectSource } from '@/services/projectSource';
import { toProject, type GitHubRepo } from './mapRepo';

export interface GitHubSourceOptions {
  readonly username: string;
  /** Injected so tests never touch the network. */
  readonly fetchImpl?: typeof fetch;
  readonly apiBase?: string;
  /** Repos matching these names are hidden (e.g. the profile README repo). */
  readonly exclude?: readonly string[];
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

/** Reads public repositories from the GitHub REST API. */
export class GitHubProjectSource implements ProjectSource {
  readonly id = 'github';

  private readonly username: string;
  private readonly fetchImpl: typeof fetch | undefined;
  private readonly apiBase: string;
  private readonly exclude: ReadonlySet<string>;

  constructor(options: GitHubSourceOptions) {
    this.username = options.username;
    // Resolved at call time, not construction, so the class can be created in
    // environments without a global fetch (jsdom).
    this.fetchImpl = options.fetchImpl;
    this.apiBase = options.apiBase ?? 'https://api.github.com';
    this.exclude = new Set(
      (options.exclude ?? [options.username]).map((name) => name.toLowerCase()),
    );
  }

  async list(query: ProjectQuery = {}): Promise<readonly Project[]> {
    const url = `${this.apiBase}/users/${encodeURIComponent(
      this.username,
    )}/repos?sort=updated&per_page=60&type=owner`;

    const doFetch = this.fetchImpl ?? globalThis.fetch;
    if (typeof doFetch !== 'function') {
      throw new GitHubApiError('No fetch implementation available.', 0);
    }

    const response = await doFetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      ...(query.signal ? { signal: query.signal } : {}),
    });

    if (!response.ok) {
      throw new GitHubApiError(
        response.status === 403
          ? 'GitHub rate limit reached.'
          : `GitHub responded with ${response.status}.`,
        response.status,
      );
    }

    const repos = (await response.json()) as GitHubRepo[];

    const projects = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .filter((repo) => !this.exclude.has(repo.name.toLowerCase()))
      .map(toProject)
      .sort((a, b) => b.stars - a.stars || b.updatedAt.localeCompare(a.updatedAt));

    return typeof query.limit === 'number' ? projects.slice(0, query.limit) : projects;
  }
}
