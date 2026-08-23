import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ProjectSource } from './projectSource';
import { GitHubProjectSource } from './github/githubProjectSource';
import { StaticProjectSource } from './staticProjectSource';
import { fallbackProjects } from './fallbackProjects';
import { profile } from '@/data/profile';

export interface Services {
  readonly projectSource: ProjectSource;
  readonly fallbackSource: ProjectSource;
}

const ServicesContext = createContext<Services | null>(null);

export function createDefaultServices(): Services {
  return {
    projectSource: new GitHubProjectSource({ username: profile.githubUser }),
    fallbackSource: new StaticProjectSource(fallbackProjects),
  };
}

interface ServicesProviderProps {
  readonly children: ReactNode;
  /** Tests and Percy runs pass their own implementations here. */
  readonly services?: Partial<Services>;
}

export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const value = useMemo<Services>(
    () => ({ ...createDefaultServices(), ...services }),
    [services],
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used inside a <ServicesProvider>.');
  }
  return context;
}
