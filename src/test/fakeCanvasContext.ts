/**
 * A recording stand-in for CanvasRenderingContext2D.
 *
 * The art in `src/art` is deliberately written as plain functions of state
 * and time so it can be exercised without a real canvas — jsdom has none,
 * and a headless browser would only tell us that *something* was painted.
 * This records the calls, so a test can assert that a flock actually crosses
 * the frame and that a scene reports itself finished.
 */
export interface RecordedCall {
  readonly op: string;
  readonly args: readonly number[];
}

export interface FakeContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly calls: RecordedCall[];
  /** Every x co-ordinate passed to moveTo, in call order. */
  moveXs(): number[];
  count(op: string): number;
  reset(): void;
}

export function createFakeContext(): FakeContext {
  const calls: RecordedCall[] = [];
  const record =
    (op: string) =>
    (...args: number[]) => {
      calls.push({ op, args });
    };

  const ctx = {
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    beginPath: record('beginPath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    quadraticCurveTo: record('quadraticCurveTo'),
    stroke: record('stroke'),
    fill: record('fill'),
    fillText: (_text: string, x: number, y: number) => {
      calls.push({ op: 'fillText', args: [x, y] });
    },
    setTransform: record('setTransform'),
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    font: '',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;

  return {
    ctx,
    calls,
    moveXs: () => calls.filter((c) => c.op === 'moveTo').map((c) => c.args[0] as number),
    count: (op) => calls.filter((c) => c.op === op).length,
    reset: () => {
      calls.length = 0;
    },
  };
}
