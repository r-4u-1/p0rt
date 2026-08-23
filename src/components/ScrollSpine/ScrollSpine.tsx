import { useMemo } from 'react';
import type { NavItem } from '@/data/navigation';
import { useSectionProgress } from '@/hooks/useSectionProgress';
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
 * The markers are spaced evenly along the rail, so the fill is measured in
 * the same section space rather than in raw document scroll; the two would
 * otherwise disagree by a fifth of the rail over the pinned hero alone.
 *
 * Decorative in the accessibility tree; the nav already exposes the links.
 */
export function ScrollSpine({ items, activeId = '' }: ScrollSpineProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const progress = useSectionProgress(ids);

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
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
