import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Hero } from './Hero';

const stats = [
  { label: 'Now', value: 'Fullstack developer' },
  { label: 'Also', value: 'Test automation' },
];

function renderHero() {
  return render(
    <Hero
      name="Test Person"
      roleLine="Developer, tester, facilitator"
      headline={['I build it,', 'then I try', 'to break it.']}
      stats={stats}
    />,
  );
}

describe('Hero', () => {
  it('exposes the headline as the single level-one heading', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('I build it,then I tryto break it.');
  });

  it('shows the name and role line', () => {
    renderHero();
    expect(screen.getByText('Test Person')).toBeInTheDocument();
    expect(screen.getByText('Developer, tester, facilitator')).toBeInTheDocument();
  });

  it('renders every status readout as a term and description pair', () => {
    renderHero();
    stats.forEach((stat) => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    });
  });

  it('offers a keyboard-reachable way past the landing view', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /read on/i })).toHaveAttribute('href', '#about');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderHero();
    expect(await axe(container)).toHaveNoViolations();
  });
});
