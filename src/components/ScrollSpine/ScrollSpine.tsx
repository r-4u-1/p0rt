import type { NavItem } from '@/data/navigation';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './ScrollSpine.module.css';

export interface ScrollSpineProps {
  readonly items: readonly NavItem[];
  readonly activeId?: string;
}

/**
 * The page's signature element: a rail that fills as you read and marks
 * each section as it passes. A vertical spine on wide screens, a hairline
 * progress bar at the top of the viewport on phones — same data, same hook.
 *
 * Decorative in the accessibility tree; the nav already exposes the links.
 */
export function ScrollSpine({ items, activeId = '' }: ScrollSpineProps) {
  const progress = useScrollProgress();

  return (
    <div
      className={styles.spine}
      aria-hidden="true"
      data-testid="scroll-spine"
      style={{ '--progress': progress } as React.CSSProperties}
    >
      <div className={styles.rail}>
        <div className={styles.fill} />
      </div>
      <ol className={styles.nodes}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={styles.node}
            data-active={item.id === activeId ? 'true' : 'false'}
            style={{ '--node-position': `${(index / (items.length - 1)) * 100}%` } as React.CSSProperties}
          >
            <span className={styles.dot} />
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
