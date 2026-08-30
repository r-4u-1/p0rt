import { useCallback, useMemo } from 'react';
import type { NavItem } from '@/data/navigation';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './ScrollSpine.module.css';

export interface ScrollSpineProps {
  readonly items: readonly NavItem[];
  readonly activeId?: string;
}

/** Matches the breakpoint at which the stylesheet grows the marker column. */
const MAP_QUERY = '(min-width: 1100px)';

/**
 * The page's signature element: a rail that fills as you read and marks each
 * section as it passes. A hairline progress bar at the top of the viewport on
 * phones; on a wide screen it becomes a section map you can actually use.
 *
 * The markers are spaced evenly along the rail, so the fill is measured in
 * the same section space rather than in raw document scroll; the two would
 * otherwise disagree by a fifth of the rail over the pinned hero alone.
 *
 * ---- On the accessibility tree ----
 * It used to be `aria-hidden` in every form, on the grounds that the nav
 * already carried the links. That is the right call for a bar that only
 * reports, and the wrong one for a control you can click: an interactive
 * element hidden from assistive technology is functionality withheld.
 *
 * So the two forms are declared honestly. The rail is always decorative — it
 * duplicates a position, not a destination. The marker column is rendered
 * only at the width where it is visible and operable, and there it is a real
 * labelled navigation with real buttons. Below that width nothing is
 * rendered at all, so a phone gains no tab stops for a control it cannot see.
 */
export function ScrollSpine({ items, activeId = '' }: ScrollSpineProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const progress = useSectionProgress(ids);
  const isMap = useMediaQuery(MAP_QUERY);

  const jumpTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    // `scrollIntoView` with no argument follows the document's own
    // `scroll-behavior`, which the reduced-motion query already sets to
    // `auto` — so the jump is smooth or instant for the same reason
    // everything else on the page is.
    target?.scrollIntoView();
  }, []);

  return (
    <div
      className={styles.spine}
      data-testid="scroll-spine"
      style={{ '--progress': progress } as React.CSSProperties}
    >
      <div className={styles.rail} aria-hidden="true">
        <div className={styles.fill} />
      </div>

      {isMap ? (
        <nav className={styles.nodes} aria-label="Section progress">
          <ol className={styles.nodeList}>
            {items.map((item, index) => (
              <li
                key={item.id}
                className={styles.node}
                data-active={item.id === activeId ? 'true' : 'false'}
                style={
                  {
                    '--node-position': `${(index / (items.length - 1)) * 100}%`,
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  className={styles.marker}
                  aria-current={item.id === activeId ? 'true' : undefined}
                  onClick={() => jumpTo(item.id)}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.label}>{item.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </div>
  );
}
