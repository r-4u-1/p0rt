import type { TimelineEntry } from '@/types/portfolio';

/** Newest first. The Timeline component never sorts — data owns the order. */
export const timeline: readonly TimelineEntry[] = [
  {
    id: 'fullstack-dev',
    role: 'Fullstack developer',
    organisation: 'Current employer',
    start: '2022',
    kind: 'development',
    summary:
      'Feature work across a React and TypeScript front end with Node and Java services behind it.',
    highlights: [
      'Rebuilt a legacy view as composable React components with CSS Modules, cutting render cost on mobile.',
      'Introduced Percy visual regression so design changes stop arriving as surprises.',
      'Mentor two junior developers through code review and pairing.',
    ],
    stack: ['TypeScript', 'React', 'Node', 'Java EE', 'Jest', 'Playwright'],
  },
  {
    id: 'scrum-master',
    role: 'Scrum master',
    organisation: 'Previous employer',
    start: '2020',
    end: '2022',
    kind: 'leadership',
    summary:
      'Facilitated two delivery teams while staying hands-on in the codebase roughly half the week.',
    highlights: [
      'Ran refinement, retros and planning for teams of six to nine people.',
      'Cut lead time by making the definition of done include automated coverage.',
      'Kept writing code — a scrum master who cannot read the backlog technically is a messenger.',
    ],
    stack: ['Scrum', 'Kanban', 'Jira', 'TypeScript', 'Python'],
  },
  {
    id: 'test-automation',
    role: 'Test automation engineer',
    organisation: 'Previous employer',
    start: '2017',
    end: '2020',
    kind: 'quality',
    summary:
      'Owned the automated test estate: unit, integration, end to end and visual.',
    highlights: [
      'Migrated a brittle TestCafe suite to Playwright, taking runtime from 40 to 11 minutes.',
      'Built pytest service tests that run against ephemeral environments in CI.',
      'Made flaky tests a tracked defect class rather than something people re-ran.',
    ],
    stack: ['Playwright', 'TestCafe', 'pytest', 'Python', 'C#', 'GitHub Actions'],
  },
  {
    id: 'developer',
    role: 'Developer',
    organisation: 'First developer role',
    start: '2015',
    end: '2017',
    kind: 'development',
    summary: 'Built and maintained internal web tools on a MERN stack.',
    highlights: [
      'Shipped the first React rewrite of an internal admin tool.',
      'Wrote the team’s first Jest tests and the habit stuck.',
    ],
    stack: ['JavaScript', 'React', 'Express', 'MongoDB', 'Jest'],
  },
  {
    id: 'education',
    role: 'Fullstack developer programme',
    organisation: 'Vocational higher education',
    start: '2013',
    end: '2015',
    kind: 'education',
    summary:
      'Two years of fullstack training with internship placements, from databases to deployment.',
    highlights: [
      'Java and JavaScript foundations, relational databases, agile methodology.',
      'Graduated with a MERN application as the final project.',
    ],
    stack: ['Java', 'JavaScript', 'SQL', 'HTML & CSS'],
  },
];
