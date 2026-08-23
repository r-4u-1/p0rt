import type { Project } from '@/types/portfolio';

/**
 * Shown when GitHub is unreachable or rate-limited, so the section is never
 * empty for a visitor. Keep these in sync with the repos you care about most.
 */
export const fallbackProjects: readonly Project[] = [
  {
    id: 'fallback-rag',
    name: 'local-rag-notes',
    description:
      'Retrieval over my own markdown notes, running entirely on Ollama. Chunking strategies are swappable so I can measure which one actually helps.',
    url: 'https://github.com/your-github-handle',
    language: 'Python',
    stars: 0,
    topics: ['rag', 'ollama', 'local-ai'],
    updatedAt: '2026-05-02T10:00:00Z',
  },
  {
    id: 'fallback-harness',
    name: 'eval-harness',
    description:
      'A small evaluation harness for prompt changes: fixed test set, scored runs, diffed results. Test automation habits pointed at models.',
    url: 'https://github.com/your-github-handle',
    language: 'TypeScript',
    stars: 0,
    topics: ['evals', 'ai', 'testing'],
    updatedAt: '2026-04-11T10:00:00Z',
  },
  {
    id: 'fallback-mern',
    name: 'mern-toolbox',
    description:
      'A MERN reference app I keep current — auth, validation, Playwright end-to-end coverage and a GitHub Actions pipeline.',
    url: 'https://github.com/your-github-handle',
    language: 'JavaScript',
    stars: 0,
    topics: ['mern', 'playwright', 'ci'],
    updatedAt: '2026-02-20T10:00:00Z',
  },
];
