import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import { FakeProjectSource, makeProject } from '@/test/fakeProjectSource';

const projects = [makeProject({ id: '1', name: 'one' })];

describe('useProjects', () => {
  it('begins in the loading state', () => {
    const { result } = renderHook(() => useProjects(new FakeProjectSource(projects), null));
    expect(result.current.status).toBe('loading');
    expect(result.current.projects).toEqual([]);
  });

  it('moves to ready with the returned projects', async () => {
    const { result } = renderHook(() => useProjects(new FakeProjectSource(projects), null));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.message).toBeNull();
  });

  it('switches to the fallback source and explains why', async () => {
    const failing = new FakeProjectSource([], new Error('GitHub rate limit reached.'));
    const fallback = new FakeProjectSource(projects);

    const { result } = renderHook(() => useProjects(failing, fallback));

    await waitFor(() => expect(result.current.status).toBe('fallback'));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.message).toMatch(/rate limit/i);
  });

  it('ends in error when there is no fallback to fall back to', async () => {
    const failing = new FakeProjectSource([], new Error('Offline.'));

    const { result } = renderHook(() => useProjects(failing, null));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.message).toBe('Offline.');
  });

  it('errors when both the source and the fallback fail', async () => {
    const failing = new FakeProjectSource([], new Error('Offline.'));

    const { result } = renderHook(() => useProjects(failing, failing));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.projects).toEqual([]);
  });

  it('passes the limit through to the source', async () => {
    const many = [makeProject({ id: '1' }), makeProject({ id: '2' }), makeProject({ id: '3' })];
    const source = new FakeProjectSource(many);

    const { result } = renderHook(() => useProjects(source, null, 2));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.projects).toHaveLength(2);
  });
});
