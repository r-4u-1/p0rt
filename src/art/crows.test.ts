import { createCrowsScene } from './crows';
import { seededRandom } from './scene';
import { createFakeContext } from '@/test/fakeCanvasContext';

const WIDTH = 800;
const HEIGHT = 300;

/** Runs the scene at a fixed 60fps for `ms`, returning the last frame's verdict. */
function run(scene: ReturnType<typeof createCrowsScene>, fake = createFakeContext(), ms = 1000) {
  const step = 16;
  let alive: boolean | void = undefined;
  for (let time = 0; time < ms; time += step) {
    alive = scene.frame({ ctx: fake.ctx, width: WIDTH, height: HEIGHT, time, delta: step });
  }
  return alive;
}

describe('createCrowsScene', () => {
  it('clears the frame before drawing, so trails never accumulate', () => {
    const fake = createFakeContext();
    const scene = createCrowsScene({ seed: 1, count: 3 });

    scene.frame({ ctx: fake.ctx, width: WIDTH, height: HEIGHT, time: 0, delta: 16 });

    expect(fake.calls[0]?.op).toBe('clearRect');
  });

  it('draws every bird as one stroked path', () => {
    const fake = createFakeContext();
    const scene = createCrowsScene({ seed: 7, count: 4, direction: 1 });
    run(scene, fake, 4000);

    // Two quadratics per bird, and one stroke per beginPath.
    expect(fake.count('beginPath')).toBe(fake.count('stroke'));
    expect(fake.count('quadraticCurveTo')).toBe(fake.count('beginPath') * 2);
  });

  it('carries the flock across the frame', () => {
    const fake = createFakeContext();
    run(createCrowsScene({ seed: 3, count: 5, direction: 1 }), fake, 9000);

    const xs = fake.moveXs();
    expect(xs.length).toBeGreaterThan(0);
    // Left to right: the first bird drawn starts left of where the last ends.
    expect(Math.max(...xs)).toBeGreaterThan(Math.min(...xs) + WIDTH / 2);
  });

  it('honours the requested direction', () => {
    const leftward = createFakeContext();
    run(createCrowsScene({ seed: 3, count: 4, direction: -1 }), leftward, 3000);
    const early = leftward.moveXs().slice(0, 8);
    const later = leftward.moveXs().slice(-8);

    expect(Math.min(...later)).toBeLessThan(Math.min(...early));
  });

  it('reports itself finished once the last bird has left', () => {
    const scene = createCrowsScene({ seed: 11, count: 3 });

    // Well past the slowest crossing at the slowest speed.
    expect(run(scene, createFakeContext(), 20_000)).toBe(false);
  });

  it('is still airborne while birds remain', () => {
    const scene = createCrowsScene({ seed: 11, count: 3 });

    expect(run(scene, createFakeContext(), 1500)).toBe(true);
  });

  it('produces a different flock for a different seed', () => {
    const a = createFakeContext();
    const b = createFakeContext();
    run(createCrowsScene({ seed: 1, count: 5, direction: 1 }), a, 3000);
    run(createCrowsScene({ seed: 2, count: 5, direction: 1 }), b, 3000);

    expect(a.moveXs()).not.toEqual(b.moveXs());
  });
});

describe('seededRandom', () => {
  it('repeats exactly for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);

    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays inside the unit interval', () => {
    const random = seededRandom(9);
    const values = Array.from({ length: 200 }, random);

    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });
});
