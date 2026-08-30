import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './Reveal.module.css';

export type RevealVariant = 'up' | 'left' | 'right' | 'fade' | 'clip';

export interface RevealProps {
  readonly children: ReactNode;
  /** Rendered element. Keeps the wrapper valid inside lists and sections. */
  readonly as?: ElementType;
  readonly variant?: RevealVariant;
  /** Stagger, in milliseconds. */
  readonly delay?: number;
  readonly threshold?: number;
  readonly className?: string;
  readonly id?: string;
  /** Merged after the delay variable, so callers can pass their own vars. */
  readonly style?: CSSProperties;
  /**
   * Marks the element as the hover/press host for any `Icon` inside it, so
   * pointing at a whole card animates its icon. Reveal is the card root in
   * several sections, which is why the flag lives here rather than forcing
   * each of them to add a wrapper element for one attribute.
   */
  readonly icoHost?: boolean;
}

/**
 * One job: reveal its children the first time they scroll into view.
 * Everything else in the app composes this rather than re-implementing
 * IntersectionObserver, and it honours reduced-motion for free.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  threshold = 0.18,
  className,
  id,
  style,
  icoHost = false,
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold });
  const visible = reducedMotion || inView;

  return (
    <Tag
      ref={ref}
      id={id}
      data-testid="reveal"
      data-visible={visible ? 'true' : 'false'}
      data-ico-host={icoHost ? '' : undefined}
      className={[styles.reveal, styles[variant], className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
