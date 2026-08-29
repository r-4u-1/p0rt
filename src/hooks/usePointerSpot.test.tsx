import { act, fireEvent, render, screen } from '@testing-library/react';
import { usePointerSpot } from './usePointerSpot';

function Probe() {
  const ref = usePointerSpot<HTMLDivElement>('[data-card]');
  return (
    <div ref={ref} data-testid="grid">
      <div data-card data-testid="a">
        <span data-testid="a-child">inside a</span>
      </div>
      <div data-card data-testid="b" />
      <span data-testid="outside">not a card</span>
    </div>
  );
}

/** jsdom has no layout, so every card reports the same 200×100 box. */
function stubLayout() {
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 50,
    left: 100,
    width: 200,
    height: 100,
    right: 300,
    bottom: 150,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  });
}

function move(target: HTMLElement, clientX: number, clientY: number, pointerType = 'mouse') {
  act(() => {
    fireEvent(
      target,
      new (class extends MouseEvent {
        pointerType = pointerType;
      })('pointermove', { clientX, clientY, bubbles: true }),
    );
  });
}

describe('usePointerSpot', () => {
  beforeEach(stubLayout);
  afterEach(() => jest.restoreAllMocks());

  it('writes the pointer position as a fraction of the card it is over', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 150, 75);

    const card = screen.getByTestId('a');
    expect(card.style.getPropertyValue('--px')).toBe('0.250');
    expect(card.style.getPropertyValue('--py')).toBe('0.250');
  });

  it('marks only the card being pointed at', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 200, 100);

    expect(screen.getByTestId('a')).toHaveAttribute('data-spot', 'true');
    expect(screen.getByTestId('b')).not.toHaveAttribute('data-spot');
  });

  it('resolves the card from a descendant, not just a direct hit', () => {
    render(<Probe />);
    move(screen.getByTestId('a-child'), 200, 100);

    expect(screen.getByTestId('a')).toHaveAttribute('data-spot', 'true');
  });

  it('hands the highlight over rather than leaving two lit', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 200, 100);
    move(screen.getByTestId('b'), 250, 120);

    expect(screen.getByTestId('a')).not.toHaveAttribute('data-spot');
    expect(screen.getByTestId('a').style.getPropertyValue('--px')).toBe('');
    expect(screen.getByTestId('b')).toHaveAttribute('data-spot', 'true');
  });

  it('clears when the pointer moves off the cards entirely', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 200, 100);
    move(screen.getByTestId('outside'), 200, 100);

    expect(screen.getByTestId('a')).not.toHaveAttribute('data-spot');
  });

  it('clears when the pointer leaves the grid', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 200, 100);

    act(() => {
      fireEvent.pointerLeave(screen.getByTestId('grid'));
    });

    expect(screen.getByTestId('a')).not.toHaveAttribute('data-spot');
  });

  it('ignores touch, which would strand a highlight where the finger lifted', () => {
    render(<Probe />);
    move(screen.getByTestId('a'), 200, 100, 'touch');

    expect(screen.getByTestId('a')).not.toHaveAttribute('data-spot');
  });

  it('does nothing at all for a visitor who asked for reduced motion', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onchange: null,
    })) as unknown as typeof window.matchMedia;

    try {
      render(<Probe />);
      move(screen.getByTestId('a'), 200, 100);

      expect(screen.getByTestId('a')).not.toHaveAttribute('data-spot');
    } finally {
      window.matchMedia = matchMedia;
    }
  });
});
