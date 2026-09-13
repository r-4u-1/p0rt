import path from 'node:path';
import defaultContent from '../src/content/defaultContent';
import { resolveSiteContent } from './siteContent';

/**
 * Jest's stand-in for `virtual:site-content`.
 *
 * Tests run against the placeholders — component tests assert on their words.
 * Setting `SITE_CONTENT` or `SITE_CONTENT_FILE` points them at real content
 * instead, which is how `scripts/check-content.mjs` runs `content.test.ts`
 * over it. The local file is deliberately ignored here.
 */
const source = resolveSiteContent({
  root: path.resolve(__dirname, '..'),
  env: process.env,
  useLocalFile: false,
});

export default source.kind === 'override' ? source.content : defaultContent;
