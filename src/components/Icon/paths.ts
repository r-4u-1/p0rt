/**
 * Icon geometry, hand-drawn on a 24×24 grid to the same rules throughout:
 * 1.6 stroke, round caps and joins, no fills, optical margin of 2–3 units.
 *
 * Stored as ordered shape lists rather than as finished SVG strings for one
 * reason — `Icon` staggers the draw-on across shapes, so the outline of a
 * shield arrives before the tick inside it. A single flattened path would
 * animate as one undifferentiated scribble.
 *
 * Swapping in an icon from elsewhere (Iconbuddy, Lucide, Phosphor, your own)
 * is a copy of its `d` attributes into a new entry here; nothing downstream
 * needs to know. Keep them stroke-based on the same 24 grid and the page's
 * motion applies to them for free.
 */

export type IconShape =
  | { readonly kind: 'path'; readonly d: string }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number };

const path = (d: string): IconShape => ({ kind: 'path', d });
const circle = (cx: number, cy: number, r: number): IconShape => ({ kind: 'circle', cx, cy, r });

export const iconPaths = {
  /** Languages — a pair of braces. */
  braces: [
    path('M9 3.2c-2 0-2 3-2 4.4s-1 4.4-3 4.4c2 0 3 1 3 4.4s0 4.4 2 4.4'),
    path('M15 3.2c2 0 2 3 2 4.4s1 4.4 3 4.4c-2 0-3 1-3 4.4s0 4.4-2 4.4'),
  ],

  /** Building — stacked planes. */
  layers: [
    path('M12 3 21 8l-9 5-9-5 9-5z'),
    path('M3 12.2l9 5 9-5'),
    path('M3 16.4l9 5 9-5'),
  ],

  /** Quality — the thing the whole page is about. */
  shieldCheck: [
    path('M12 2.6 20 5.6v5.7c0 4.6-3.2 8.4-8 10.1-4.8-1.7-8-5.5-8-10.1V5.6l8-3z'),
    path('M8.4 12.1 10.9 14.7 15.6 9.6'),
  ],

  /** AI in practice. */
  cpu: [
    path('M6.5 5.5h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z'),
    path('M9.5 9.5h5v5h-5z'),
    path('M9.5 2.4v3.1M14.5 2.4v3.1M9.5 18.5v3.1M14.5 18.5v3.1'),
    path('M2.4 9.5h3.1M2.4 14.5h3.1M18.5 9.5h3.1M18.5 14.5h3.1'),
  ],

  terminal: [
    path('M4.5 4.5h15a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z'),
    path('M7.6 9.4 10.4 12l-2.8 2.6'),
    path('M13 15h3.6'),
  ],

  users: [
    circle(9, 7.6, 3.4),
    path('M3 20.4c0-3.3 2.7-6 6-6s6 2.7 6 6'),
    path('M15.8 4.5a3.4 3.4 0 0 1 0 6.2'),
    path('M17.4 14.7c2.1.9 3.6 3 3.6 5.7'),
  ],

  cap: [
    path('M12 3.6 2.4 8.4 12 13.2l9.6-4.8L12 3.6z'),
    path('M6.4 10.6v4.6c0 1.7 2.5 3.1 5.6 3.1s5.6-1.4 5.6-3.1v-4.6'),
    path('M20.8 9v5.6'),
  ],

  mail: [
    path('M4 5.6h16a1 1 0 0 1 1 1v10.8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.6a1 1 0 0 1 1-1z'),
    path('M3.4 7 12 13.1 20.6 7'),
  ],

  github: [
    path(
      'M15.4 21v-3.3c0-1.1-.4-1.9-.9-2.3 3.1-.4 5.5-1.6 5.5-5.7 0-1.3-.4-2.4-1.2-3.2.2-.4.5-1.6-.1-3.3 0 0-1-.3-3.3 1.2a11.3 11.3 0 0 0-5.8 0C7.3 3 6.3 3.2 6.3 3.2c-.6 1.7-.3 2.9-.1 3.3-.8.8-1.2 1.9-1.2 3.2 0 4.1 2.4 5.3 5.5 5.7-.4.4-.7 1-.8 1.8V21',
    ),
    path('M9.7 17.8c-2.7.9-4.1-.4-4.9-1.7-.5-.9-1.2-1.2-1.7-1.2'),
  ],

  linkedin: [
    path('M5.6 3.6h12.8a2 2 0 0 1 2 2v12.8a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2z'),
    path('M8.1 10.6V17'),
    circle(8.1, 7.4, 0.5),
    path('M12.2 17v-6.4'),
    path('M12.2 13.6a2.4 2.4 0 0 1 4.8 0V17'),
  ],

  star: [
    path('M12 3.4l2.7 5.4 6 .9-4.35 4.2 1.03 5.9L12 17l-5.38 2.8 1.03-5.9L3.3 9.7l6-.9L12 3.4z'),
  ],

  gitBranch: [
    path('M6.6 6.4v11.2'),
    circle(6.6, 4, 2.4),
    circle(6.6, 20, 2.4),
    circle(17.4, 7.2, 2.4),
    path('M17.4 9.6v1.2a4 4 0 0 1-4 4H9'),
  ],

  arrowUpRight: [path('M7.2 16.8 16.8 7.2'), path('M9.2 7.2h7.6v7.6')],

  arrowDown: [path('M12 3.8v15'), path('M5.8 12.8 12 19.4l6.2-6.6')],

  /** In progress — a live trace rather than a tool. */
  pulse: [path('M2.6 12.4h4.1l2.7-6.8 4.2 13 2.6-6.2h5.2')],

  book: [
    path('M3.6 4.4h5.6A2.8 2.8 0 0 1 12 7.2v12.4a2.2 2.2 0 0 0-2.2-2.2H3.6V4.4z'),
    path('M20.4 4.4h-5.6A2.8 2.8 0 0 0 12 7.2v12.4a2.2 2.2 0 0 1 2.2-2.2h6.2V4.4z'),
  ],

  compass: [circle(12, 12, 8.6), path('m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1z')],

  pin: [path('M12 21.2s7-6.4 7-11.2a7 7 0 1 0-14 0c0 4.8 7 11.2 7 11.2z'), circle(12, 10, 2.6)],

  monitor: [
    path('M3.4 4.6h17.2a1 1 0 0 1 1 1v9.6a1 1 0 0 1-1 1H3.4a1 1 0 0 1-1-1V5.6a1 1 0 0 1 1-1z'),
    path('M12 16.2v4'),
    path('M8.2 20.2h7.6'),
  ],

  globe: [
    circle(12, 12, 8.6),
    path('M3.6 12h16.8'),
    path('M12 3.4c2.3 2.5 3.5 5.5 3.5 8.6s-1.2 6.1-3.5 8.6c-2.3-2.5-3.5-5.5-3.5-8.6s1.2-6.1 3.5-8.6z'),
  ],

  spark: [
    path('M12 2.8 13.9 8.1 19.2 10 13.9 11.9 12 17.2 10.1 11.9 4.8 10 10.1 8.1 12 2.8z'),
    path('M18.4 15.4l.75 1.95 1.95.75-1.95.75-.75 1.95-.75-1.95-1.95-.75 1.95-.75.75-1.95z'),
  ],
} as const;

export type IconName = keyof typeof iconPaths;
