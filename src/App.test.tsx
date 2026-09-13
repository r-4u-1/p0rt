import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from './App';
import { renderWithServices } from '@/test/renderWithServices';
import { FakeProjectSource, makeProject } from '@/test/fakeProjectSource';
import { en, sv } from '@/test/content';

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
    en.nav.forEach((item) => {
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

  /*
   * The spine has two forms and declares each one honestly. Narrow, it is a
   * progress bar: it reports a position, duplicates no destination, and is
   * hidden. Wide, it grows a marker column you can click, and hiding an
   * interactive control from assistive technology would be withholding
   * functionality — so there it is a labelled navigation instead.
   */
  it('keeps the reporting half of the scroll spine out of the accessibility tree', async () => {
    await renderApp();
    const spine = screen.getByTestId('scroll-spine');

    expect(spine.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders no spine controls at widths where the map is not shown', async () => {
    // jsdom's matchMedia stub reports false, i.e. a narrow viewport.
    await renderApp();
    const spine = screen.getByTestId('scroll-spine');

    expect(spine.querySelector('nav')).toBeNull();
    expect(spine.querySelectorAll('button')).toHaveLength(0);
  });

  it('loads projects through the injected source rather than the network', async () => {
    await renderApp();
    const projects = screen.getByRole('region', { name: /live from github/i });
    expect(await within(projects).findByRole('link', { name: /demo-repo/i })).toBeInTheDocument();
  });

  /*
   * The language control is the only thing on the page that changes every
   * other thing on the page. One press has to move the nav, the section
   * headings, the prose and the document itself — anything still in English
   * afterwards is a string a component kept for itself instead of taking as
   * a prop.
   */
  describe('switching language', () => {
    it("renders the whole page in the other language", async () => {
      const user = userEvent.setup();
      await renderApp();
      expect(screen.getByRole("heading", { name: en.about.title })).toBeInTheDocument();

      await user.click(screen.getByTestId("language-toggle"));

      expect(screen.getByRole("heading", { name: sv.about.title })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(sv.nav[3]?.label ?? "", "i") })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: en.about.title })).toBeNull();
    });

    it("tells the document which language it is now in", async () => {
      const user = userEvent.setup();
      await renderApp();

      await user.click(screen.getByTestId("language-toggle"));

      expect(document.documentElement.lang).toBe("sv");
      expect(document.title).toBe(sv.meta.documentTitle);
    });

    it("keeps the section anchors, so a link shared in one language works in the other", async () => {
      const user = userEvent.setup();
      await renderApp();

      await user.click(screen.getByTestId("language-toggle"));

      en.nav.forEach((item) => expect(document.getElementById(item.id)).not.toBeNull());
    });
  });

  it('has no detectable accessibility violations across the whole page', async () => {
    const { container } = await renderApp();

    expect(await axe(container)).toHaveNoViolations();
  }, 20000);
});
