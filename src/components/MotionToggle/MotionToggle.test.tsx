import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MotionToggle } from './MotionToggle';
import { setSystemReducedMotion } from '@/test/motion';
import { getMotionSnapshot } from '@/motion/motionPreference';

const toggle = () => screen.getByTestId('motion-toggle');

describe('MotionToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-motion');
  });

  it('reads as pressed while the page is allowed to move', () => {
    setSystemReducedMotion(false);

    render(<MotionToggle />);

    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
  });

  it('reads as unpressed when the system asked for less motion', () => {
    setSystemReducedMotion(true);

    render(<MotionToggle />);

    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops the page when pressed', async () => {
    setSystemReducedMotion(false);
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.click(toggle());

    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
    expect(getMotionSnapshot().reduced).toBe(true);
  });

  /*
   * The reason the toggle exists at all: `prefers-reduced-motion` cannot
   * express "my OS says reduce, but show me what this does".
   */
  it('starts a page the system had stopped', async () => {
    setSystemReducedMotion(true);
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.click(toggle());

    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
    expect(getMotionSnapshot().reduced).toBe(false);
  });

  it('flips the document attribute the stylesheet keys off', async () => {
    setSystemReducedMotion(false);
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.click(toggle());

    expect(document.documentElement.dataset.motion).toBe('off');
  });

  it('remembers the choice for the next visit', async () => {
    setSystemReducedMotion(false);
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.click(toggle());

    expect(localStorage.getItem('portfolio:motion')).toBe('off');
  });

  it('is operable from the keyboard', async () => {
    setSystemReducedMotion(false);
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('explains what pressing it will do, in both states', async () => {
    setSystemReducedMotion(false);
    const user = userEvent.setup();
    render(<MotionToggle />);

    expect(toggle()).toHaveAttribute('title', 'Turn page animation off');
    await user.click(toggle());
    expect(toggle()).toHaveAttribute('title', 'Turn page animation on');
  });

  it('keeps its indicator out of the accessibility tree', () => {
    setSystemReducedMotion(false);
    const { container } = render(<MotionToggle />);

    // aria-pressed already carries the state; the bars are the sighted copy.
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    setSystemReducedMotion(false);
    const { container } = render(<MotionToggle />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
