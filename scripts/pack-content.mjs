#!/usr/bin/env node
/**
 * Combines `en.json` and `sv.json` into the single document the build accepts
 * as site content: `{ "en": {...}, "sv": {...} }`, minified onto one line.
 *
 *   node scripts/pack-content.mjs [dir] [out] [--force]
 *
 *   dir  folder holding en.json and sv.json   (default: src/content)
 *   out  file to write                        (default: site-content.local.json)
 *
 * One line matters: GitHub masks a secret in logs line by line, and the
 * secret size limit is 48 KB. Refuses to overwrite `out` without --force,
 * because that file is where the real content lives.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SECRET_LIMIT_BYTES = 48 * 1024;

const args = process.argv.slice(2);
const force = args.includes('--force');
const [dir = 'src/content', out = 'site-content.local.json'] = args.filter((a) => a !== '--force');

if (existsSync(out) && !force) {
  console.error(`${out} already exists. Pass --force to overwrite it.`);
  process.exit(1);
}

const read = (language) => JSON.parse(readFileSync(path.join(dir, `${language}.json`), 'utf8'));
const packed = JSON.stringify({ en: read('en'), sv: read('sv') });
writeFileSync(out, `${packed}\n`, 'utf8');

const bytes = Buffer.byteLength(packed);
console.error(`Wrote ${out} (${(bytes / 1024).toFixed(1)} KB).`);
if (bytes > SECRET_LIMIT_BYTES) {
  console.error('Warning: larger than the 48 KB GitHub secret limit.');
  process.exitCode = 1;
}
