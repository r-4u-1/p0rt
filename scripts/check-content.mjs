#!/usr/bin/env node
/**
 * Runs `src/content/content.test.ts` — the shape and translation-parity
 * checks — against the real site content instead of the placeholders.
 *
 *   node scripts/check-content.mjs [--quiet]
 *
 * Uses $SITE_CONTENT or $SITE_CONTENT_FILE when set, otherwise
 * site-content.local.json. With nothing to check it succeeds and says so.
 *
 * --quiet is for CI: Jest's failure output quotes the values it compared,
 * and the log of a public repository is public. Run without it locally to
 * see what failed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const quiet = process.argv.includes('--quiet');
const env = { ...process.env };
const LOCAL = 'site-content.local.json';

if (!env.SITE_CONTENT?.trim() && !env.SITE_CONTENT_FILE?.trim()) {
  if (!existsSync(LOCAL)) {
    console.log('No site content configured; the placeholders are checked by the normal test run.');
    process.exit(0);
  }
  env.SITE_CONTENT_FILE = LOCAL;
}

const result = spawnSync(
  process.execPath,
  ['node_modules/jest/bin/jest.js', 'src/content/content.test.ts', '--coverage=false'],
  { env, stdio: quiet ? 'ignore' : 'inherit' },
);

if (result.status !== 0) {
  console.error(
    quiet
      ? 'Site content failed src/content/content.test.ts. Details are hidden to keep them out of the log; ' +
          'run `node scripts/check-content.mjs` locally against the same content to see them.'
      : 'Site content failed src/content/content.test.ts.',
  );
  process.exit(result.status ?? 1);
}
console.log('Site content passes src/content/content.test.ts.');
