import { iconPaths } from './paths';
import type { IconName } from './paths';
import styles from './Icon.module.css';

/** What the icon does once its outline has arrived. */
export type IconMotion = 'draw' | 'trace' | 'spin' | 'nudge' | 'pulse' | 'none';

export interface IconProps {
  readonly name: IconName;
  /** Size in pixels; the stroke stays optically even because it scales too. */
  readonly size?: number;
  readonly motion?: IconMotion;
  /** Accessible name. Omit for decoration — the icon is then hidden. */
  readonly label?: string;
  readonly className?: string;
}

/**
 * Inline SVG icon, drawn rather than dropped in.
 *
 * Every shape carries `pathLength="1"`, which normalises the dash geometry:
 * one `stroke-dasharray: 1` rule then animates a 60-unit tick and a 300-unit
 * shield outline at the same visual rate, with no per-icon measurement and
 * nothing to re-tune when a path changes. The reveal is inherited — an
 * ancestor marked `[data-visible="true"]` draws its icons — so an icon
 * animates with the content it labels rather than on a timer of its own.
 *
 * Decorative by default: no `label` means `aria-hidden`, because the icons
 * here sit beside text that already says the same thing.
 */
export function Icon({ name, size = 20, motion = 'draw', label, className }: IconProps) {
  const shapes = iconPaths[name];

  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(' ')}
      data-motion={motion}
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {shapes.map((shape, index) => {
        const shared = {
          className: styles.shape,
          pathLength: 1,
          style: { '--shape-index': index } as React.CSSProperties,
        };
        return shape.kind === 'circle' ? (
          <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} {...shared} />
        ) : (
          <path key={index} d={shape.d} {...shared} />
        );
      })}
    </svg>
  );
}
