import type { ElementType, ReactNode } from 'react';
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
      className={[styles.reveal, styles[variant], className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
