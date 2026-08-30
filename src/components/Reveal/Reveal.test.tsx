import { act, render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';
import { triggerIntersection, observedElementCount } from '@/test/intersectionObserver';
import { setSystemReducedMotion } from '@/test/motion';

describe('Reveal', () => {
  it('always renders its children, animated or not', () => {
    render(<Reveal>Findable content</Reveal>);
    expect(screen.getByText('Findable content')).toBeInTheDocument();
  });

  it('starts hidden and reveals once the element intersects', () => {
    render(<Reveal>Scroll target</Reveal>);
    const wrapper = screen.getByTestId('reveal');

    expect(wrapper).toHaveAttribute('data-visible', 'false');

    act(() => triggerIntersection(true));

    expect(wrapper).toHaveAttribute('data-visible', 'true');
  });

  it('does not re-hide after scrolling back past it', () => {
    render(<Reveal>Once only</Reveal>);
    const wrapper = screen.getByTestId('reveal');

    act(() => triggerIntersection(true));
    act(() => triggerIntersection(false));

    expect(wrapper).toHaveAttribute('data-visible', 'true');
  });

  it('observes the element it renders', () => {
    render(<Reveal>Observed</Reveal>);
    expect(observedElementCount()).toBe(1);
  });

  it('renders the requested element type so it stays valid inside a list', () => {
    render(
      <ul>
        <Reveal as="li">List row</Reveal>
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('List row');
  });

  it('applies the stagger delay as a custom property', () => {
    render(<Reveal delay={240}>Delayed</Reveal>);
    expect(screen.getByTestId('reveal')).toHaveStyle({ '--reveal-delay': '240ms' });
  });

  it('skips the hidden state entirely when reduced motion is requested', () => {
    setSystemReducedMotion(true);

    render(<Reveal>No motion</Reveal>);

    expect(screen.getByTestId('reveal')).toHaveAttribute('data-visible', 'true');
  });
});
