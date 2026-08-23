import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Nav } from './Nav';
import type { NavItem } from '@/data/navigation';

const items: readonly NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

function renderNav(activeId = '') {
  return render(<Nav items={items} activeId={activeId} brand="Test Person" />);
}

describe('Nav', () => {
  it('renders one link per section', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: /sections/i });
    expect(within(nav).getAllByRole('link')).toHaveLength(items.length);
  });

  it('links point at the matching section anchors', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects');
  });

  it('marks the section in view as current', () => {
    renderNav('projects');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('link', { name: /about/i })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the menu, keeping aria-expanded in sync', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', { name: /menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(screen.getByRole('button', { name: /close/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes the menu when a link is chosen', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('link', { name: /contact/i }));

    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', { name: /menu/i });
    await user.click(toggle);
    await user.keyboard('{Escape}');

    const reopened = screen.getByRole('button', { name: /menu/i });
    expect(reopened).toHaveAttribute('aria-expanded', 'false');
    expect(reopened).toHaveFocus();
  });

  it('locks page scroll only while the menu is open', async () => {
    const user = userEvent.setup();
    renderNav();

    expect(document.body.dataset['scrollLocked']).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /menu/i }));
    expect(document.body.dataset['scrollLocked']).toBe('true');

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(document.body.dataset['scrollLocked']).toBeUndefined();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderNav('about');
    expect(await axe(container)).toHaveNoViolations();
  });
});
