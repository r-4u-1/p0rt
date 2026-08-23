import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Projects } from './Projects';
import { renderWithServices } from '@/test/renderWithServices';
import { FakeProjectSource, makeProject } from '@/test/fakeProjectSource';

const projects = [
  makeProject({ id: '1', name: 'local-rag-notes', language: 'Python', stars: 4 }),
  makeProject({ id: '2', name: 'eval-harness', language: 'TypeScript', stars: 2 }),
];

describe('Projects', () => {
  it('announces loading before the repositories arrive', () => {
    renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: new FakeProjectSource(projects) },
    });

    expect(screen.getByTestId('projects-status')).toHaveTextContent(/loading repositories/i);
    expect(screen.getAllByTestId('project-skeleton')).not.toHaveLength(0);
  });

  it('renders a card per repository once loaded', async () => {
    renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: new FakeProjectSource(projects) },
    });

    expect(await screen.findByRole('link', { name: /local-rag-notes/i })).toHaveAttribute(
      'href',
      'https://github.com/example/example-repo',
    );
    expect(screen.getByRole('link', { name: /eval-harness/i })).toBeInTheDocument();
  });

  it('removes the loading skeletons when the data resolves', async () => {
    renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: new FakeProjectSource(projects) },
    });

    await waitForElementToBeRemoved(() => screen.queryAllByTestId('project-skeleton'));
    expect(screen.getByTestId('projects-status')).toHaveTextContent('2 public repositories');
  });

  it('falls back to the saved selection when GitHub fails', async () => {
    const failing = new FakeProjectSource([], new Error('GitHub rate limit reached.'));
    const fallback = new FakeProjectSource([makeProject({ id: '9', name: 'saved-repo' })]);

    renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: failing, fallbackSource: fallback },
    });

    expect(await screen.findByRole('link', { name: /saved-repo/i })).toBeInTheDocument();
    expect(screen.getByTestId('projects-status')).toHaveTextContent(/rate limit/i);
    expect(screen.getByTestId('projects-status')).toHaveTextContent(/saved selection/i);
  });

  it('points visitors at GitHub when nothing can be loaded at all', async () => {
    const failing = new FakeProjectSource([], new Error('Network down.'));

    renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: failing, fallbackSource: failing },
    });

    await waitFor(() =>
      expect(screen.getByTestId('projects-status')).toHaveTextContent('Network down.'),
    );
    expect(screen.getByRole('link', { name: /github\.com\/octocat/i })).toBeInTheDocument();
  });

  it('asks the source for no more repositories than it will render', async () => {
    const source = new FakeProjectSource(projects);
    renderWithServices(<Projects githubUser="octocat" limit={2} />, {
      services: { projectSource: source },
    });

    await screen.findByRole('link', { name: /local-rag-notes/i });
    expect(source.calls).toBe(1);
  });

  it('has no detectable accessibility violations once loaded', async () => {
    const { container } = renderWithServices(<Projects githubUser="octocat" />, {
      services: { projectSource: new FakeProjectSource(projects) },
    });

    await screen.findByRole('link', { name: /local-rag-notes/i });
    expect(await axe(container)).toHaveNoViolations();
  });
});
