import { useEffect, useState } from 'react';
import type { Project } from '@/types/portfolio';
import type { ProjectSource } from '@/services/projectSource';

export type ProjectsStatus = 'loading' | 'ready' | 'fallback' | 'error';

export interface ProjectsState {
  readonly status: ProjectsStatus;
  readonly projects: readonly Project[];
  readonly message: string | null;
}

/**
 * Owns loading state only. It takes sources as arguments rather than
 * constructing them, so the same hook serves production, tests and Percy.
 */
export function useProjects(
  source: ProjectSource,
  fallback: ProjectSource | null,
  limit = 6,
): ProjectsState {
  const [state, setState] = useState<ProjectsState>({
    status: 'loading',
    projects: [],
    message: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    source
      .list({ limit, signal: controller.signal })
      .then((projects) => {
        if (!active) return;
        setState({ status: 'ready', projects, message: null });
      })
      .catch(async (error: unknown) => {
        if (!active || controller.signal.aborted) return;
        // The reason, verbatim and untranslated: it came from GitHub, and a
        // guess at what it meant would be worse than the sentence itself.
        // What the page does about it is the component's line to write.
        const message = error instanceof Error ? error.message : 'Could not reach GitHub.';

        if (!fallback) {
          setState({ status: 'error', projects: [], message });
          return;
        }
        try {
          const projects = await fallback.list({ limit });
          if (!active) return;
          setState({ status: 'fallback', projects, message });
        } catch {
          if (active) setState({ status: 'error', projects: [], message });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, fallback, limit]);

  return state;
}
