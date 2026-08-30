import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ScrollSpine } from './ScrollSpine';
import { navItems } from '@/data/navigation';
import { installMatchMedia } from '@/test/media';

const MAP_QUERY = '(min-width: 1100px)';

const spine = () => screen.getByTestId('scroll-spine');

describe('ScrollSpine', () => {
  describe('as a progress bar (narrow)', () => {
    beforeEach(() => {
      installMatchMedia({ [MAP_QUERY]: false });
    });

    it('reports a position and nothing else', () => {
      render(<ScrollSpine items={navItems} />);

      expect(spine().querySelector('nav')).toBeNull();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    /*
     * The bar duplicates a position, not a destination. Announcing it would
     * add noise without adding a way to get anywhere.
     */
    it('keeps the bar out of the accessibility tree', () => {
      render(<ScrollSpine items={navItems} />);

      expect(spine().querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('adds no tab stops to a viewport that cannot show the map', async () => {
      const user = userEvent.setup();
      render(
        <>
          <ScrollSpine items={navItems} />
          <button type="button">after</button>
        </>,
      );

      await user.tab();

      expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
    });
  });

  describe('as a section map (wide)', () => {
    beforeEach(() => {
      installMatchMedia({ [MAP_QUERY]: true });
    });

    it('becomes a labelled navigation, distinct from the main one', () => {
      render(<ScrollSpine items={navItems} />);

      expect(screen.getByRole('navigation', { name: /section progress/i })).toBeInTheDocument();
    });

    it('offers one control per section', () => {
      render(<ScrollSpine items={navItems} />);

      expect(screen.getAllByRole('button')).toHaveLength(navItems.length);
    });

    it('marks the section being read', () => {
      render(<ScrollSpine items={navItems} activeId="projects" />);

      const current = screen.getByRole('button', { current: true });
      expect(current).toHaveAccessibleName(/projects/i);
    });

    it('marks nothing when no section is active', () => {
      render(<ScrollSpine items={navItems} />);

      expect(screen.queryByRole('button', { current: true })).toBeNull();
    });

    it('scrolls to a section when its marker is pressed', async () => {
      const user = userEvent.setup();
      const target = document.createElement('section');
      target.id = 'journey';
      const scrollIntoView = jest.fn();
      target.scrollIntoView = scrollIntoView;
      document.body.appendChild(target);

      try {
        render(<ScrollSpine items={navItems} />);
        await user.click(screen.getByRole('button', { name: /journey/i }));

        expect(scrollIntoView).toHaveBeenCalledTimes(1);
        // No argument: the jump follows the document's own scroll-behaviour,
        // which the reduced-motion query already switches to `auto`.
        expect(scrollIntoView).toHaveBeenCalledWith();
      } finally {
        target.remove();
      }
    });

    it('does not fall over when a section is missing from the page', async () => {
      const user = userEvent.setup();
      render(<ScrollSpine items={navItems} />);

      await expect(
        user.click(screen.getByRole('button', { name: /approach/i })),
      ).resolves.not.toThrow();
    });

    it('is operable from the keyboard', async () => {
      const user = userEvent.setup();
      const target = document.createElement('section');
      target.id = 'about';
      const scrollIntoView = jest.fn();
      target.scrollIntoView = scrollIntoView;
      document.body.appendChild(target);

      try {
        render(<ScrollSpine items={navItems} />);
        await user.tab();
        expect(screen.getByRole('button', { name: /about/i })).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(scrollIntoView).toHaveBeenCalled();
      } finally {
        target.remove();
      }
    });

    it('has no detectable accessibility violations', async () => {
      const { container } = render(<ScrollSpine items={navItems} activeId="stack" />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it('spaces its markers evenly along the rail', () => {
    installMatchMedia({ [MAP_QUERY]: true });
    render(<ScrollSpine items={navItems} />);

    const positions = [...spine().querySelectorAll('li')].map((node) =>
      node.style.getPropertyValue('--node-position'),
    );

    expect(positions[0]).toBe('0%');
    expect(positions[positions.length - 1]).toBe('100%');
  });
});
