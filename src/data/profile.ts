import type { Profile } from '@/types/portfolio';

/**
 * EDIT ME — everything personal lives in `src/data`. No component needs
 * changing when you update a job, a link or a skill.
 */
export const profile: Profile = {
  name: 'Your Name',
  githubUser: 'your-github-handle',
  roleLine: 'Fullstack developer · test automation · scrum master',
  location: 'Sweden — remote or hybrid',
  availability: 'Open to new roles',
  intro: [
    'I build web applications end to end and then I try very hard to break them. Ten of those years have been spent moving between three seats — writing the feature, automating the tests that keep it honest, and facilitating the team that ships it.',
    'Day to day that means JavaScript and TypeScript on React front ends, Python and Java on the back, and a C# service when the platform calls for it. I care most about the part people rarely see: a suite that fails for the right reason, a component that stays readable a year later, an interface that works with a keyboard.',
    'Outside work I run models locally with Ollama and pair with Claude on side projects, mostly to understand where AI actually earns its place in a workflow and where it just adds noise.',
  ],
  facts: [
    { label: 'Based in', value: 'Sweden' },
    { label: 'Working style', value: 'Remote / hybrid' },
    { label: 'Education', value: 'Fullstack developer' },
    { label: 'Languages', value: 'Swedish, English' },
  ],
  channels: [
    {
      id: 'email',
      label: 'Email',
      value: 'hello@example.com',
      href: 'mailto:hello@example.com',
    },
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/your-github-handle',
      href: 'https://github.com/your-github-handle',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'linkedin.com/in/your-handle',
      href: 'https://www.linkedin.com/in/your-handle',
    },
  ],
};
