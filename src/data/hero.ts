import type { HeroStat } from '@/components/Hero';

export const heroHeadline: readonly string[] = [
  'I build it,',
  'then I try',
  'to break it.',
];

export const heroStats: readonly HeroStat[] = [
  {
    label: 'Now',
    value: 'Fullstack developer — TypeScript and React on the front, Node and Java behind it.',
  },
  {
    label: 'Also',
    value: 'Test automation across Playwright, pytest and Percy. Three years as scrum master.',
  },
  {
    label: 'After hours',
    value: 'Local models on Ollama, retrieval pipelines, and a robotics kit waiting on the desk.',
  },
];
