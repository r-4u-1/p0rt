import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Contact } from './Contact';
import type { Profile } from '@/types/portfolio';

const profile: Profile = {
  name: 'Test Person',
  githubUser: 'octocat',
  roleLine: 'Developer',
  location: 'Sweden — remote or hybrid',
  availability: 'Open to new roles',
  intro: ['Intro paragraph.'],
  facts: [{ label: 'Based in', value: 'Sweden' }],
  channels: [
    { id: 'email', label: 'Email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/octocat',
      href: 'https://github.com/octocat',
    },
  ],
};

describe('Contact', () => {
  it('is exposed as a footer landmark', () => {
    render(<Contact profile={profile} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders a working link for every contact channel', () => {
    render(<Contact profile={profile} />);
    expect(screen.getByRole('link', { name: /hello@example\.com/i })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    );
    expect(screen.getByRole('link', { name: /github\.com\/octocat/i })).toHaveAttribute(
      'href',
      'https://github.com/octocat',
    );
  });

  it('states availability and location', () => {
    render(<Contact profile={profile} />);
    expect(
      screen.getByText(/open to new roles · sweden — remote or hybrid/i),
    ).toBeInTheDocument();
  });

  it('shows the current year in the copyright line', () => {
    render(<Contact profile={profile} />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Test Person`)).toBeInTheDocument();
  });

  it('offers a route back to the top of the page', () => {
    render(<Contact profile={profile} />);
    expect(screen.getByRole('link', { name: /back to top/i })).toHaveAttribute('href', '#home');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Contact profile={profile} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
