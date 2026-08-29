import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Icon } from './Icon';
import { iconPaths } from './paths';
import type { IconName } from './paths';

const names = Object.keys(iconPaths) as IconName[];

describe('Icon', () => {
  it('is decorative unless it is given a name of its own', () => {
    const { container } = render(<Icon name="star" />);
    const svg = container.querySelector('svg') as SVGElement;

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('becomes an image with an accessible name when labelled', () => {
    render(<Icon name="star" label="Starred" />);

    expect(screen.getByRole('img', { name: 'Starred' })).toBeInTheDocument();
  });

  it('is never reachable by tab, labelled or not', () => {
    const { container } = render(<Icon name="mail" label="Email" />);

    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it.each(names)('normalises %s so one dash rule can animate every shape', (name) => {
    const { container } = render(<Icon name={name} />);
    const shapes = container.querySelectorAll('path, circle');

    expect(shapes.length).toBeGreaterThan(0);
    shapes.forEach((shape) => {
      // Without pathLength="1" the draw-on would run at a different speed
      // for every icon, in proportion to its outline's real length.
      expect(shape).toHaveAttribute('pathLength', '1');
    });
  });

  it.each(names)('draws %s with no fill, so the stroke is the whole shape', (name) => {
    const { container } = render(<Icon name={name} />);

    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
  });

  it('numbers its shapes so the outline can arrive before what is inside it', () => {
    const { container } = render(<Icon name="shieldCheck" />);
    const shapes = [...container.querySelectorAll('path, circle')];

    expect(shapes.map((s) => (s as SVGElement).style.getPropertyValue('--shape-index'))).toEqual([
      '0',
      '1',
    ]);
  });

  it('scales the box with the requested size', () => {
    const { container } = render(<Icon name="cpu" size={32} />);
    const svg = container.querySelector('svg') as SVGElement;

    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <p>
        <Icon name="github" /> Repository
      </p>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
