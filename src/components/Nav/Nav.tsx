import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { NavItem } from '@/data/navigation';
import { MotionToggle } from '@/components/MotionToggle';
import { useScrollLock } from '@/hooks/useScrollLock';
import styles from './Nav.module.css';

export interface NavProps {
  readonly items: readonly NavItem[];
  /** Section id currently in view, used for the active marker. */
  readonly activeId?: string;
  readonly brand: string;
}

/**
 * Site navigation. Renders one list of links; CSS decides whether that list
 * is an inline bar or a full-screen panel, so there is a single source of
 * truth for the menu on every breakpoint.
 */
export function Nav({ items, activeId = '', brand }: NavProps) {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useScrollLock(open);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className={`${styles.header} ${condensed ? styles.condensed : ''}`}>
      <a className={styles.brand} href="#home" onClick={close}>
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandText}>{brand}</span>
      </a>

      <div className={styles.controls}>
        <MotionToggle className={styles.motion} />

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.bars} aria-hidden="true">
            <span />
            <span />
          </span>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav
        id={panelId}
        className={styles.panel}
        data-open={open ? 'true' : 'false'}
        aria-label="Sections"
      >
        <ul className={styles.list}>
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            return (
              <li
                key={item.id}
                className={styles.item}
                style={{ '--item-index': index } as React.CSSProperties}
              >
                <a
                  href={`#${item.id}`}
                  className={styles.link}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={close}
                >
                  <span className={styles.linkIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
