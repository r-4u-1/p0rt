import type { Project } from '@/types/portfolio';

export interface ProjectQuery {
  /** Upper bound on how many projects the UI wants to render. */
  readonly limit?: number;
  readonly signal?: AbortSignal;
}

/**
 * The abstraction the UI depends on (Dependency Inversion).
 *
 * `ProjectsSection` asks a `ProjectSource` for projects. It has no idea
 * whether they came from the GitHub REST API, a JSON file, or a stub in a
 * test — which is exactly why adding a GitLab source later needs zero
 * changes to any component (Open/Closed).
 */
export interface ProjectSource {
  readonly id: string;
  list(query?: ProjectQuery): Promise<readonly Project[]>;
}
