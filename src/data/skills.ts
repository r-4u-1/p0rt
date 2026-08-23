import type { SkillGroup } from '@/types/portfolio';

export const skillGroups: readonly SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    caption: 'What I write in every week',
    skills: [
      { name: 'TypeScript', level: 'core', note: 'Default for anything front end' },
      { name: 'JavaScript', level: 'core', note: 'Node and browser' },
      { name: 'Python', level: 'strong', note: 'Automation, data, AI tooling' },
      { name: 'Java', level: 'strong', note: 'Java EE services' },
      { name: 'C#', level: 'working', note: 'Enough to be useful on a .NET team' },
      { name: 'SQL', level: 'working', note: 'Postgres and MySQL' },
    ],
  },
  {
    id: 'building',
    title: 'Building',
    caption: 'Frameworks and runtimes',
    skills: [
      { name: 'React', level: 'core', note: 'Hooks, composition, CSS Modules' },
      { name: 'MERN stack', level: 'strong', note: 'Mongo, Express, React, Node' },
      { name: 'Java EE', level: 'strong', note: 'Enterprise services and APIs' },
      { name: 'REST & JSON APIs', level: 'core' },
      { name: 'Git & CI/CD', level: 'strong', note: 'GitHub Actions pipelines' },
    ],
  },
  {
    id: 'quality',
    title: 'Quality',
    caption: 'The part I am known for',
    skills: [
      { name: 'Jest + Testing Library', level: 'core', note: 'Unit and component' },
      { name: 'Playwright', level: 'core', note: 'End to end, cross browser' },
      { name: 'TestCafe', level: 'strong', note: 'Legacy suites and migrations' },
      { name: 'pytest', level: 'strong', note: 'Service and integration tests' },
      { name: 'Percy', level: 'strong', note: 'Visual regression on every PR' },
      { name: 'Accessibility testing', level: 'working', note: 'axe, keyboard, screen reader' },
    ],
  },
  {
    id: 'ai',
    title: 'AI in practice',
    caption: 'Mostly private projects, increasingly at work',
    skills: [
      { name: 'Claude', level: 'strong', note: 'Pairing, review, test generation' },
      { name: 'Ollama & local models', level: 'working', note: 'Offline, private by default' },
      { name: 'Prompt & context design', level: 'working' },
      { name: 'RAG pipelines', level: 'exploring', note: 'Retrieval over own documents' },
      { name: 'Eval harnesses', level: 'exploring', note: 'Measuring, not vibing' },
    ],
  },
];
