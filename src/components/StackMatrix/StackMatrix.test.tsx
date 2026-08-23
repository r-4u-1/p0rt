import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StackMatrix } from './StackMatrix';
import type { SkillGroup } from '@/types/portfolio';

const groups: readonly SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    caption: 'Written weekly',
    skills: [
      { name: 'TypeScript', level: 'core', note: 'Default for front end' },
      { name: 'C#', level: 'working' },
    ],
  },
  {
    id: 'ai',
    title: 'AI in practice',
    caption: 'Mostly private projects',
    skills: [{ name: 'RAG pipelines', level: 'exploring' }],
  },
];

describe('StackMatrix', () => {
  it('renders a group per category', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI in practice' })).toBeInTheDocument();
  });

  it('states proficiency in words, not only as a bar', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Working knowledge')).toBeInTheDocument();
    expect(screen.getByText('Learning now')).toBeInTheDocument();
  });

  it('keeps each skill inside its own group', () => {
    render(<StackMatrix groups={groups} />);
    const languages = screen.getByRole('heading', { name: 'Languages' }).closest('li');
    expect(languages).not.toBeNull();
    expect(within(languages as HTMLElement).getByText('TypeScript')).toBeInTheDocument();
    expect(within(languages as HTMLElement).queryByText('RAG pipelines')).toBeNull();
  });

  it('shows the optional note only when there is one', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByText('Default for front end')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StackMatrix groups={groups} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
