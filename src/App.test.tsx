import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from './App';
import { renderWithServices } from '@/test/renderWithServices';
import { FakeProjectSource, makeProject } from '@/test/fakeProjectSource';
import { navItems } from '@/data/navigation';

/** Renders and waits for the injected project load, so no state settles after a test ends. */
async function renderApp() {
  const result = renderWithServices(<App />, {
    services: {
      projectSource: new FakeProjectSource([makeProject({ id: '1', name: 'demo-repo' })]),
    },
  });
  await screen.findByRole('link', { name: /demo-repo/i });
  return result;
}

describe('App', () => {
  it('exposes the expected landmarks', async () => {
    await renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has exactly one level-one heading', async () => {
    await renderApp();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders a section for every navigation entry', async () => {
    await renderApp();
    navItems.forEach((item) => {
      expect(document.getElementById(item.id)).not.toBeNull();
    });
  });

  it('puts a skip link first in the tab order', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.tab();

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveFocus();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('keeps the decorative scroll spine out of the accessibility tree', async () => {
    await renderApp();
    expect(screen.getByTestId('scroll-spine')).toHaveAttribute('aria-hidden', 'true');
  });

  it('loads projects through the injected source rather than the network', async () => {
    await renderApp();
    const projects = screen.getByRole('region', { name: /live from github/i });
    expect(await within(projects).findByRole('link', { name: /demo-repo/i })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations across the whole page', async () => {
    const { container } = await renderApp();

    expect(await axe(container)).toHaveNoViolations();
  }, 20000);
});
