import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Section } from './Section';

describe('Section', () => {
  it('associates the region with its heading for screen readers', () => {
    render(
      <Section id="about" eyebrow="About" title="Three seats, one product">
        <p>Body copy</p>
      </Section>,
    );

    const region = screen.getByRole('region', { name: 'Three seats, one product' });
    expect(region).toHaveAttribute('id', 'about');
  });

  it('renders the lead paragraph only when given one', () => {
    const { rerender } = render(
      <Section id="stack" eyebrow="Stack" title="What I reach for">
        <p>Body</p>
      </Section>,
    );
    expect(screen.queryByText('Honest levels')).toBeNull();

    rerender(
      <Section id="stack" eyebrow="Stack" title="What I reach for" lead="Honest levels">
        <p>Body</p>
      </Section>,
    );
    expect(screen.getByText('Honest levels')).toBeInTheDocument();
  });

  it('flags the ink surface so nested components can invert their colours', () => {
    render(
      <Section id="journey" eyebrow="Journey" title="Where I have worked" surface="ink">
        <p>Body</p>
      </Section>,
    );
    expect(screen.getByRole('region')).toHaveAttribute('data-surface', 'ink');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <Section id="about" eyebrow="About" title="Heading" lead="Lead">
        <p>Body</p>
      </Section>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
