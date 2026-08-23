import { StaticProjectSource } from './staticProjectSource';
import { fallbackProjects } from './fallbackProjects';
import type { ProjectSource } from './projectSource';

describe('StaticProjectSource', () => {
  it('satisfies the same contract as any other source', async () => {
    const source: ProjectSource = new StaticProjectSource(fallbackProjects);
    const projects = await source.list();

    expect(source.id).toBe('static');
    expect(projects).toHaveLength(fallbackProjects.length);
  });

  it('applies the limit like the network source does', async () => {
    const source = new StaticProjectSource(fallbackProjects);
    expect(await source.list({ limit: 1 })).toHaveLength(1);
  });

  it('never rejects, which is the point of a fallback', async () => {
    const source = new StaticProjectSource([]);
    await expect(source.list()).resolves.toEqual([]);
  });
});
