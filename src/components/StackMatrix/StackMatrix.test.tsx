import { act, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PINNABLE, StackMatrix } from './StackMatrix';
import type { SkillGroup } from '@/types/portfolio';
import { installMatchMedia } from '@/test/media';
import { setMotionSetting } from '@/motion/motionPreference';

const groups: readonly SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    caption: 'Written weekly',
    skills: [
      { name: 'TypeScript', level: 'core', note: 'Default for front end' },
      { name: 'C#', level: 'working' },
    ],
  },
  {
    id: 'ai',
    title: 'AI in practice',
    caption: 'Mostly private projects',
    skills: [{ name: 'RAG pipelines', level: 'exploring' }],
  },
];

describe('StackMatrix', () => {
  it('renders a group per category', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI in practice' })).toBeInTheDocument();
  });

  it('states proficiency in words, not only as a bar', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Working knowledge')).toBeInTheDocument();
    expect(screen.getByText('Learning now')).toBeInTheDocument();
  });

  it('keeps each skill inside its own group', () => {
    render(<StackMatrix groups={groups} />);
    const languages = screen.getByRole('heading', { name: 'Languages' }).closest('li');
    expect(languages).not.toBeNull();
    expect(within(languages as HTMLElement).getByText('TypeScript')).toBeInTheDocument();
    expect(within(languages as HTMLElement).queryByText('RAG pipelines')).toBeNull();
  });

  it('shows the optional note only when there is one', () => {
    render(<StackMatrix groups={groups} />);
    expect(screen.getByText('Default for front end')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).toBeNull();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StackMatrix groups={groups} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  /*
   * The rail is the idea, so the rail is the base layout — a native
   * scroll-snap track that works on every device. On any screen tall enough
   * to frame a panel, with motion enabled, it is enhanced into a pinned
   * scrub driven by page scroll — phones included.
   *
   * The distinction is not cosmetic: in one mode the rail is a real scroll
   * container whose contents are unreachable by keyboard without a tab stop;
   * in the other it is a window that page scroll drives, and a tab stop would
   * strand focus somewhere the browser cannot scroll to.
   */
  describe('the two traverse modes', () => {
    const rail = () => document.querySelector('[class*="rail"]') as HTMLElement;

    it('is a keyboard-reachable scroll container on a screen too short to pin', () => {
      installMatchMedia({ [PINNABLE]: false });

      render(<StackMatrix groups={groups} />);

      expect(rail()).toHaveAttribute('tabindex', '0');
      expect(rail()).toHaveAccessibleName(/scrolls sideways/i);
    });

    it('drops the tab stop once page scroll is driving the traverse', () => {
      installMatchMedia({ [PINNABLE]: true });

      render(<StackMatrix groups={groups} />);

      expect(rail()).not.toHaveAttribute('tabindex');
      expect(rail()).not.toHaveAttribute('role');
    });

    /*
     * Turning motion off has to leave a rail that still reaches every panel.
     * An earlier version fell back to a stacked grid whose runway was
     * zero-length, which stranded three of the four groups off-screen.
     */
    it('hands back the scrollable rail when the visitor turns motion off', () => {
      installMatchMedia({ [PINNABLE]: true });
      setMotionSetting('off');

      render(<StackMatrix groups={groups} />);

      expect(rail()).toHaveAttribute('tabindex', '0');
    });

    /*
     * The toggle's reason for existing. A visitor whose OS says reduce can
     * still ask for the full thing, and asking has to actually give it to
     * them — including the pinned traverse, which a media query alone would
     * keep switched off forever.
     */
    it('pins for a visitor who overrides a system that asked for less motion', () => {
      installMatchMedia({
        [PINNABLE]: true,
        '(prefers-reduced-motion: reduce)': true,
      });
      render(<StackMatrix groups={groups} />);
      expect(rail()).toHaveAttribute('tabindex', '0');

      act(() => setMotionSetting('on'));

      expect(rail()).not.toHaveAttribute('tabindex');
    });

    it('renders every group in both modes', () => {
      installMatchMedia({ [PINNABLE]: true });
      const { unmount } = render(<StackMatrix groups={groups} />);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(groups.length);
      unmount();

      installMatchMedia({ [PINNABLE]: false });
      render(<StackMatrix groups={groups} />);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(groups.length);
    });

    it('reports the traverse with one readout, whichever mode is driving it', () => {
      installMatchMedia({ [PINNABLE]: false });

      render(<StackMatrix groups={groups} />);

      const readout = document.querySelector('[class*="readout"]') as HTMLElement;
      expect(readout).toHaveAttribute('aria-hidden', 'true');
      expect(readout).toHaveTextContent(`${groups.length} groups`);
    });

    it('has no accessibility violations in the scrollable mode', async () => {
      installMatchMedia({ [PINNABLE]: false });

      const { container } = render(<StackMatrix groups={groups} />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
