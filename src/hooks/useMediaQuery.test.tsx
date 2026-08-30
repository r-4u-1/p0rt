import { render, screen } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';
import { installMatchMedia } from '@/test/media';

const QUERY = '(min-width: 1100px)';

function Probe() {
  const matches = useMediaQuery(QUERY);
  return <p data-testid="probe">{matches ? 'wide' : 'narrow'}</p>;
}

describe('useMediaQuery', () => {
  it('reports whether the query matches right now', () => {
    installMatchMedia({ [QUERY]: true });

    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('wide');
  });

  it('reports a miss', () => {
    installMatchMedia({ [QUERY]: false });

    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('narrow');
  });

  it('re-renders when the viewport crosses the breakpoint', () => {
    const media = installMatchMedia({ [QUERY]: false });
    render(<Probe />);

    media.set(QUERY, true);

    expect(screen.getByTestId('probe')).toHaveTextContent('wide');
  });

  it('detaches its listener on unmount', () => {
    const media = installMatchMedia({ [QUERY]: false });
    const { unmount } = render(<Probe />);
    expect(media.listenerCount).toBeGreaterThan(0);

    unmount();

    expect(media.listenerCount).toBe(0);
  });

  it('assumes no match where matchMedia does not exist', () => {
    const matchMedia = window.matchMedia;
    // @ts-expect-error deliberately removing the API
    delete window.matchMedia;

    try {
      render(<Probe />);
      expect(screen.getByTestId('probe')).toHaveTextContent('narrow');
    } finally {
      window.matchMedia = matchMedia;
    }
  });
});
