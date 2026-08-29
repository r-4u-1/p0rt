import type { Scene, SceneFrame } from './scene';
import { seededRandom } from './scene';

export interface CrowsOptions {
  /** Stroke colour for the silhouettes. */
  readonly color?: string;
  readonly count?: number;
  /** Seed the flock so a Percy snapshot is not a coin toss. */
  readonly seed?: number;
  /** 1 flies left → right, -1 right → left. Omit to let the seed decide. */
  readonly direction?: 1 | -1;
}

interface Crow {
  /** Progress across the width, in multiples of the travel distance. */
  t: number;
  /** Fraction of the height the bird holds, before bobbing. */
  lane: number;
  speed: number;
  span: number;
  flapRate: number;
  flapPhase: number;
  /** Amplitude of the slow vertical drift, in pixels. */
  bob: number;
  bobRate: number;
}

const TRAVEL_MARGIN = 0.18;

/**
 * A loose flock crossing the section once, then gone.
 *
 * Deliberately not a boids simulation: real corvids crossing a skyline at
 * distance read as a handful of pulsing chevrons at slightly different
 * speeds and heights, and that is all the eye needs. Each bird is two
 * quadratic curves whose control points rise and fall — three drawing
 * operations per crow, so nine of them cost less than one blurred div.
 *
 * The scene reports itself finished once the last bird clears the far edge,
 * which lets the host stop the loop entirely rather than idling.
 */
export function createCrowsScene({
  color = 'rgba(199, 204, 216, 0.55)',
  count = 7,
  seed = 20260829,
  direction,
}: CrowsOptions = {}): Scene {
  const random = seededRandom(seed);
  const heading: 1 | -1 = direction ?? (random() > 0.5 ? 1 : -1);

  const crows: Crow[] = Array.from({ length: count }, (_, index) => {
    // A ragged echelon rather than a tidy V — staggered entry, and each bird
    // a little below and behind the one before it.
    const rank = index / Math.max(1, count - 1);
    return {
      t: -0.08 - rank * 0.1 - random() * 0.06,
      lane: 0.14 + rank * 0.44 + random() * 0.1,
      speed: 0.115 + random() * 0.055,
      span: 12 + random() * 14,
      flapRate: 0.0055 + random() * 0.0035,
      flapPhase: random() * Math.PI * 2,
      bob: 8 + random() * 16,
      bobRate: 0.0008 + random() * 0.0009,
    };
  });

  function drawCrow(ctx: CanvasRenderingContext2D, crow: Crow, x: number, y: number) {
    const flap = Math.sin(crow.flapPhase);

    /*
     * Tip and wing-middle are driven separately, and the middle keeps a
     * standing droop that the flap only modulates. Move them together and
     * the wing straightens out at the top of every stroke, which for one
     * frame in four draws a horizontal dash instead of a bird — the giveaway
     * that a flock is two curves and a sine wave.
     */
    const tip = -crow.span * (0.12 + 0.3 * flap);
    const middle = crow.span * (0.3 - 0.22 * flap);

    ctx.lineWidth = Math.max(1, crow.span * 0.11);
    ctx.beginPath();
    ctx.moveTo(x - crow.span, y + tip);
    ctx.quadraticCurveTo(x - crow.span * 0.45, y + middle, x, y);
    ctx.quadraticCurveTo(x + crow.span * 0.45, y + middle, x + crow.span, y + tip);
    ctx.stroke();
  }

  return {
    frame({ ctx, width, height, time, delta }: SceneFrame) {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const travel = width * (1 + TRAVEL_MARGIN * 2);
      let airborne = false;

      for (const crow of crows) {
        crow.t += (crow.speed * delta) / 1000;
        crow.flapPhase += crow.flapRate * delta;

        if (crow.t < 0) {
          airborne = true;
          continue;
        }
        if (crow.t > 1) continue;
        airborne = true;

        const along = -TRAVEL_MARGIN + crow.t * (1 + TRAVEL_MARGIN * 2);
        const x = heading === 1 ? along * travel : width - along * travel;
        const y = crow.lane * height + Math.sin(time * crow.bobRate + crow.flapPhase) * crow.bob;

        // Fade in and out at the edges so nothing pops into existence.
        ctx.globalAlpha = Math.min(1, crow.t * 7, (1 - crow.t) * 7);
        drawCrow(ctx, crow, x, y);
      }

      ctx.globalAlpha = 1;
      return airborne;
    },
  };
}
