import { useEffect, useRef } from 'react';
import type { Scene, SceneFactory } from '@/art/scene';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseCanvasSceneOptions {
  /** Called once per run. Re-invoked on replay, so it may randomise freely. */
  readonly factory: SceneFactory;
  /** Run the scene again each time the canvas re-enters the viewport. */
  readonly replay?: boolean;
  /** Milliseconds to wait after entering view before the first frame. */
  readonly delay?: number;
}

/** A backgrounded tab must not resume with one enormous time step. */
const MAX_DELTA = 48;

/**
 * Runs a `Scene` on a canvas, and owns every reason a canvas should *stop*:
 * off screen, hidden tab, finished, or a visitor who asked for reduced
 * motion. Decorative art that keeps painting behind a section nobody is
 * looking at is the usual way a page like this starts draining a battery.
 *
 * The scene itself stays a pure function of time — see `art/scene.ts`.
 */
export function useCanvasScene({ factory, replay = true, delay = 0 }: UseCanvasSceneOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const factoryRef = useRef(factory);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    factoryRef.current = factory;
  }, [factory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scene: Scene | null = null;
    let frame: number | null = null;
    let timer: number | null = null;
    let started = 0;
    let previous = 0;
    let finished = false;
    let width = 0;
    let height = 0;
    let inView = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Reset before scaling: setTransform is idempotent, scale() compounds.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene?.resize?.(width, height);
    };

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (timer !== null) window.clearTimeout(timer);
      frame = null;
      timer = null;
    };

    const tick = (now: number) => {
      if (!scene) return;
      const delta = previous === 0 ? 16 : Math.min(MAX_DELTA, now - previous);
      previous = now;

      const alive = scene.frame({ ctx, width, height, time: now - started, delta });
      if (alive === false) {
        finished = true;
        ctx.clearRect(0, 0, width, height);
        frame = null;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame !== null || timer !== null) return;
      if (finished && !replay) return;

      timer = window.setTimeout(() => {
        timer = null;
        if (!inView || document.hidden) return;
        if (!scene || finished) {
          scene = factoryRef.current();
          finished = false;
          resize();
        }
        started = performance.now();
        previous = 0;
        frame = requestAnimationFrame(tick);
      }, delay);
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry) return;
              inView = entry.isIntersecting;
              if (inView) {
                if (finished && replay) scene = null;
                start();
              } else {
                stop();
              }
            },
            { rootMargin: '10% 0px' },
          );

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => resize());

    resize();
    observer?.observe(canvas);
    resizeObserver?.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);

    // Without IntersectionObserver, run rather than show an empty canvas.
    if (!observer) {
      inView = true;
      start();
    }

    return () => {
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, replay, delay]);

  return { canvasRef, disabled: reducedMotion } as const;
}
