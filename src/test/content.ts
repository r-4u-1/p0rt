import { content } from '@/content';

/**
 * The real language files, for tests.
 *
 * A component test needs words to render, and inventing a fixture for every
 * one of them would test a shape the site does not actually ship. These are
 * what the page really says; where a test needs something smaller or
 * sharper — two skill groups instead of four — it spreads over the slice it
 * cares about rather than rebuilding the whole thing.
 */
export const en = content.en;
export const sv = content.sv;
