import type { SceneFactory } from '@/art/scene';
import { useCanvasScene } from '@/hooks/useCanvasScene';
import styles from './CanvasScene.module.css';

export interface CanvasSceneProps {
  readonly factory: SceneFactory;
  readonly replay?: boolean;
  readonly delay?: number;
  readonly className?: string;
}

/**
 * Decorative canvas layer, sized to its positioned parent.
 *
 * Purely a host: it owns no drawing, only the element and the lifecycle
 * (see `useCanvasScene`). Under reduced motion it renders nothing at all
 * rather than a frozen frame — a still of falling code is a smear, and a
 * still of a flock is a mistake.
 */
export function CanvasScene({ factory, replay, delay, className }: CanvasSceneProps) {
  const { canvasRef, disabled } = useCanvasScene({ factory, replay, delay });

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="canvas-scene"
      className={[styles.canvas, className].filter(Boolean).join(' ')}
    />
  );
}
