import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Timeline } from './Timeline';
import { triggerIntersection } from '@/test/intersectionObserver';
import type { TimelineEntry } from '@/types/portfolio';

const entries: readonly TimelineEntry[] = [
  {
    id: 'now',
    role: 'Fullstack developer',
    organisation: 'Current employer',
    start: '2022',
    kind: 'development',
    summary: 'Feature work across React and Java services.',
    highlights: ['Introduced visual regression testing.'],
    stack: ['TypeScript', 'React'],
  },
  {
    id: 'before',
    role: 'Test automation engineer',
    organisation: 'Previous employer',
    start: '2017',
    end: '2020',
    kind: 'quality',
    summary: 'Owned the automated test estate.',
    highlights: ['Migrated TestCafe suites to Playwright.'],
    stack: ['Playwright', 'pytest'],
  },
];

describe('Timeline', () => {
  it('renders one entry per employment', () => {
    render(<Timeline entries={entries} />);
    expect(screen.getAllByTestId('timeline-item')).toHaveLength(entries.length);
  });

  it('keeps the data order rather than sorting internally', () => {
    render(<Timeline entries={entries} />);
    const roles = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(roles).toEqual(['Fullstack developer', 'Test automation engineer']);
  });

  it('describes an open-ended role as running to the present', () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText('2022 – present')).toBeInTheDocument();
    expect(screen.getByText('2017 – 2020')).toBeInTheDocument();
  });

  it('labels the kind of role so the mix of seats is readable', () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Quality engineering')).toBeInTheDocument();
  });

  it('reveals each entry when it scrolls into view', () => {
    render(<Timeline entries={entries} />);
    const items = screen.getAllByTestId('timeline-item');
    expect(items[0]).toHaveAttribute('data-visible', 'false');

    act(() => triggerIntersection(true));

    screen.getAllByTestId('timeline-item').forEach((item) => {
      expect(item).toHaveAttribute('data-visible', 'true');
    });
  });

  it('lists highlights and tooling for each role', () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText('Migrated TestCafe suites to Playwright.')).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: /tools used as test automation engineer/i }),
    ).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Timeline entries={entries} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
