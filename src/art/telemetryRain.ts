import type { Scene, SceneFrame } from './scene';
import { seededRandom } from './scene';

export interface TelemetryRainOptions {
  /** Colour of the leading glyph. */
  readonly head?: string;
  /** Colour of the glyph immediately behind it. */
  readonly trail?: string;
  /** Opaque colour laid over the canvas each frame to age the trails. */
  readonly fade?: string;
  readonly seed?: number;
  /** Roughly the fraction of columns raining at any moment. */
  readonly density?: number;
}

interface Column {
  /** Head position in rows; fractional between steps. */
  row: number;
  rowsPerSecond: number;
  /** Last integer row drawn, so a glyph is committed exactly once. */
  drawn: number;
  active: boolean;
  /** Seconds still to wait before this column starts falling again. */
  wait: number;
}

const CELL = 18;
const FONT_SIZE = 12;

/**
 * The glyph set is the point. Katakana would make this someone else's
 * reference; hex, comparison operators, assertion marks and bar glyphs make
 * it this page's own — a stream of the things a test run actually prints.
 */
const GLYPHS = [
  ...'0123456789ABCDEF',
  ...'0123456789ABCDEF',
  ...'{}[]()<>/\\|;:=+-*',
  ...'✓✗·░▒▓▁▃▅',
  ...'λΣΔ∞≠≈',
];

/**
 * Falling telemetry behind the "what I am learning next" section.
 *
 * Trails are aged by painting the section's own background over the canvas
 * at low alpha each frame, so one `fillRect` plus two `fillText` calls per
 * active column carry the whole effect — the alternative, redrawing every
 * glyph of every trail, costs roughly fifteen times as much for a result
 * nobody can tell apart. Columns advance on their own clock rather than per
 * frame, which is what makes the fall read as stepped rows instead of a
 * smooth slide.
 */
export function createTelemetryRainScene({
  head = '#b7f2e6',
  trail = 'rgba(18, 184, 160, 0.72)',
  fade = 'rgba(14, 17, 22, 0.085)',
  seed = 4711,
  density = 0.55,
}: TelemetryRainOptions = {}): Scene {
  const random = seededRandom(seed);
  let columns: Column[] = [];
  let rows = 0;

  const glyph = () => GLYPHS[Math.floor(random() * GLYPHS.length)] as string;

  function spawn(): Column {
    return {
      row: -Math.floor(random() * 12),
      rowsPerSecond: 7 + random() * 13,
      drawn: -1,
      active: random() < density,
      wait: random() * 5,
    };
  }

  return {
    resize(width: number, height: number) {
      rows = Math.ceil(height / CELL);
      const wanted = Math.ceil(width / CELL);
      // Keep the columns that already exist so a resize does not restart the
      // whole field; only add or drop at the right-hand edge.
      if (wanted > columns.length) {
        columns = columns.concat(Array.from({ length: wanted - columns.length }, spawn));
      } else {
        columns.length = wanted;
      }
    },

    frame({ ctx, width, height, delta }: SceneFrame) {
      if (columns.length === 0) {
        rows = Math.ceil(height / CELL);
        columns = Array.from({ length: Math.ceil(width / CELL) }, spawn);
      }

      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      const seconds = delta / 1000;

      for (let index = 0; index < columns.length; index += 1) {
        const column = columns[index] as Column;

        if (!column.active) {
          column.wait -= seconds;
          if (column.wait <= 0) {
            columns[index] = { ...spawn(), active: true, wait: 0, row: -2 };
          }
          continue;
        }

        column.row += column.rowsPerSecond * seconds;
        const row = Math.floor(column.row);
        if (row === column.drawn) continue;
        column.drawn = row;

        if (row > rows + 2) {
          columns[index] = { ...spawn(), active: false, wait: 0.4 + random() * 4 };
          continue;
        }

        const x = index * CELL + (CELL - FONT_SIZE) / 2;

        // The glyph one row back, dimmed — the step between bright head and
        // aged trail is what stops the column reading as a single streak.
        if (row > 0) {
          ctx.fillStyle = trail;
          ctx.fillText(glyph(), x, (row - 1) * CELL);
        }
        if (row >= 0) {
          ctx.fillStyle = head;
          ctx.fillText(glyph(), x, row * CELL);
        }
      }
    },
  };
}
