import { createTelemetryRainScene } from './telemetryRain';
import { createFakeContext } from '@/test/fakeCanvasContext';

const WIDTH = 720;
const HEIGHT = 360;

function run(scene: ReturnType<typeof createTelemetryRainScene>, fake = createFakeContext(), ms = 2000) {
  const step = 16;
  for (let time = 0; time < ms; time += step) {
    scene.frame({ ctx: fake.ctx, width: WIDTH, height: HEIGHT, time, delta: step });
  }
  return fake;
}

describe('createTelemetryRainScene', () => {
  it('ages the trails with one fill per frame rather than redrawing them', () => {
    const fake = createFakeContext();
    const scene = createTelemetryRainScene({ seed: 5 });

    for (let i = 0; i < 10; i += 1) {
      scene.frame({ ctx: fake.ctx, width: WIDTH, height: HEIGHT, time: i * 16, delta: 16 });
    }

    expect(fake.count('fillRect')).toBe(10);
  });

  it('writes glyphs as the columns fall', () => {
    const fake = run(createTelemetryRainScene({ seed: 5 }));

    expect(fake.count('fillText')).toBeGreaterThan(0);
  });

  it('never runs off the right-hand edge', () => {
    const fake = run(createTelemetryRainScene({ seed: 5, density: 1 }));
    const xs = fake.calls.filter((c) => c.op === 'fillText').map((c) => c.args[0] as number);

    expect(Math.max(...xs)).toBeLessThan(WIDTH);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
  });

  it('steps by row rather than drawing every frame', () => {
    const fake = createFakeContext();
    const scene = createTelemetryRainScene({ seed: 5, density: 1 });
    scene.resize?.(WIDTH, HEIGHT);

    // One frame at 16ms cannot advance a column a whole row at any of the
    // configured speeds, so at most a handful of columns commit a glyph.
    scene.frame({ ctx: fake.ctx, width: WIDTH, height: HEIGHT, time: 0, delta: 16 });
    const columns = Math.ceil(WIDTH / 18);

    expect(fake.count('fillText')).toBeLessThan(columns * 2);
  });

  it('keeps existing columns across a resize instead of restarting the field', () => {
    const scene = createTelemetryRainScene({ seed: 5, density: 1 });
    const fake = createFakeContext();

    run(scene, fake, 1200);
    fake.reset();
    scene.resize?.(WIDTH * 2, HEIGHT);
    run(scene, fake, 300);

    // Widening adds columns; it must not stall the ones already falling.
    expect(fake.count('fillText')).toBeGreaterThan(0);
  });

  it('runs indefinitely — it is weather, not an event', () => {
    const scene = createTelemetryRainScene({ seed: 5 });
    const last = scene.frame({
      ctx: createFakeContext().ctx,
      width: WIDTH,
      height: HEIGHT,
      time: 60_000,
      delta: 16,
    });

    expect(last).not.toBe(false);
  });
});
