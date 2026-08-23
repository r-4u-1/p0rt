import type { Principle } from '@/types/portfolio';

export const principles: readonly Principle[] = [
  {
    id: 'tests-are-design',
    title: 'Tests are a design tool',
    body: 'If a component is hard to test it is usually badly shaped. I write the test to find that out early, not to satisfy a coverage gate.',
  },
  {
    id: 'small-surfaces',
    title: 'Small surfaces, clear seams',
    body: 'One reason to change per module, dependencies pointing at interfaces rather than implementations. This page is built that way — the project list does not know GitHub exists.',
  },
  {
    id: 'accessible-default',
    title: 'Accessible by default',
    body: 'Keyboard paths, focus order, contrast and reduced motion are part of done. Automated axe checks catch the obvious; I check the rest by hand.',
  },
  {
    id: 'facilitate',
    title: 'Facilitation is engineering work',
    body: 'Three years as scrum master taught me that most delivery problems are unclear scope, not slow typing. I still run refinement I am invited to.',
  },
  {
    id: 'ai-with-evidence',
    title: 'AI with a measurement attached',
    body: 'I use Claude and local models daily, and I treat their output like any contribution — reviewed, tested, and rejected when it is wrong.',
  },
];
