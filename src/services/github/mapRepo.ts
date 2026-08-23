import type { Project } from '@/types/portfolio';

/** The subset of the GitHub repo payload this app relies on. */
export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

/** Single responsibility: translate one transport shape into the domain shape. */
export function toProject(repo: GitHubRepo): Project {
  return {
    id: String(repo.id),
    name: repo.name,
    description: repo.description?.trim() || 'No description on GitHub yet.',
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count ?? 0,
    topics: repo.topics ?? [],
    updatedAt: repo.updated_at,
  };
}
