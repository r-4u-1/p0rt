/**
 * The contract between a piece of canvas art and the component that hosts it.
 *
 * Scenes are plain functions of state and time. They know nothing about
 * React, IntersectionObserver, device pixel ratio or reduced motion — the
 * host owns all of that — which is what makes them testable with a fake 2D
 * context and reusable anywhere a canvas exists.
 */

/** Everything a scene needs to draw one frame. */
export interface SceneFrame {
  readonly ctx: CanvasRenderingContext2D;
  /** Logical size in CSS pixels; the host has already applied the DPR scale. */
  readonly width: number;
  readonly height: number;
  /** Milliseconds since the scene started. */
  readonly time: number;
  /** Milliseconds since the previous frame, clamped so a backgrounded tab
      cannot resume with one enormous step. */
  readonly delta: number;
}

export interface Scene {
  /**
   * Draw one frame. Return `false` to declare the scene finished — the host
   * stops the loop and clears the canvas. Anything else means "keep going".
   */
  frame(state: SceneFrame): boolean | void;
  /** Called when the canvas is resized, before the next frame. */
  resize?(width: number, height: number): void;
}

export type SceneFactory = () => Scene;

/**
 * Small deterministic PRNG (mulberry32). Seeded randomness keeps the art
 * reproducible in tests and in Percy snapshots while still looking arbitrary
 * to a visitor.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
