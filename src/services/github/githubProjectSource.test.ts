import { GitHubApiError, GitHubProjectSource } from './githubProjectSource';
import type { GitHubRepo } from './mapRepo';

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'portfolio',
    description: 'A description',
    html_url: 'https://github.com/octocat/portfolio',
    language: 'TypeScript',
    stargazers_count: 5,
    topics: ['react'],
    updated_at: '2026-05-01T00:00:00Z',
    fork: false,
    archived: false,
    ...overrides,
  };
}

function fetchReturning(repos: GitHubRepo[], ok = true, status = 200): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => repos,
  });
}

describe('GitHubProjectSource', () => {
  it('requests the owner’s repositories sorted by recency', async () => {
    const fetchImpl = fetchReturning([repo()]);
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await source.list();

    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toContain('/users/octocat/repos');
    expect(url).toContain('sort=updated');
  });

  it('maps the transport payload onto the domain shape', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([repo()]) as unknown as typeof fetch,
    });

    const [project] = await source.list();

    expect(project).toEqual({
      id: '1',
      name: 'portfolio',
      description: 'A description',
      url: 'https://github.com/octocat/portfolio',
      language: 'TypeScript',
      stars: 5,
      topics: ['react'],
      updatedAt: '2026-05-01T00:00:00Z',
    });
  });

  it('substitutes a readable description when GitHub has none', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([repo({ description: null })]) as unknown as typeof fetch,
    });

    const [project] = await source.list();
    expect(project?.description).toMatch(/no description/i);
  });

  it('leaves out forks, archived repos and the profile readme', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([
        repo({ id: 1, name: 'keeper' }),
        repo({ id: 2, name: 'a-fork', fork: true }),
        repo({ id: 3, name: 'old', archived: true }),
        repo({ id: 4, name: 'octocat' }),
      ]) as unknown as typeof fetch,
    });

    const names = (await source.list()).map((project) => project.name);
    expect(names).toEqual(['keeper']);
  });

  it('orders by stars, then by most recently updated', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([
        repo({ id: 1, name: 'quiet', stargazers_count: 1 }),
        repo({ id: 2, name: 'popular', stargazers_count: 9 }),
        repo({ id: 3, name: 'fresh', stargazers_count: 1, updated_at: '2026-06-01T00:00:00Z' }),
      ]) as unknown as typeof fetch,
    });

    expect((await source.list()).map((project) => project.name)).toEqual([
      'popular',
      'fresh',
      'quiet',
    ]);
  });

  it('honours the limit the caller asked for', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([
        repo({ id: 1, name: 'one' }),
        repo({ id: 2, name: 'two' }),
        repo({ id: 3, name: 'three' }),
      ]) as unknown as typeof fetch,
    });

    expect(await source.list({ limit: 2 })).toHaveLength(2);
  });

  it('explains a rate limit rather than throwing a bare status code', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([], false, 403) as unknown as typeof fetch,
    });

    await expect(source.list()).rejects.toThrow(GitHubApiError);
    await expect(source.list()).rejects.toThrow(/rate limit/i);
  });

  it('reports other failures with their status', async () => {
    const source = new GitHubProjectSource({
      username: 'octocat',
      fetchImpl: fetchReturning([], false, 500) as unknown as typeof fetch,
    });

    await expect(source.list()).rejects.toThrow('GitHub responded with 500.');
  });
});
