import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { findSiteContentProblems } from '../src/content/shape';

/**
 * Where the site's words come from.
 *
 * The repository is public, so the committed `src/content/*.json` are
 * placeholders. The real content is one JSON document with both languages,
 * `{ "en": {...}, "sv": {...} }`, supplied at build time. First match wins:
 *
 *   1. `SITE_CONTENT`       – the document itself, e.g. a GitHub Actions secret
 *   2. `SITE_CONTENT_FILE`  – a path to the document
 *   3. `site-content.local.json` in the project root (git-ignored; dev and
 *      local builds only, never tests)
 *   4. the placeholders
 *
 * An override that is present but broken fails loudly instead of falling
 * back: silently deploying the placeholder site is the worse outcome.
 */

export const CONTENT_ENV = 'SITE_CONTENT';
export const CONTENT_FILE_ENV = 'SITE_CONTENT_FILE';
export const LOCAL_CONTENT_FILE = 'site-content.local.json';

export type SiteContentSource =
  | { readonly kind: 'placeholder' }
  | {
      readonly kind: 'override';
      /** Human-readable origin for logs. Never the content. */
      readonly origin: string;
      /** Absolute path when the content came from a file, so dev can watch it. */
      readonly file?: string;
      readonly content: Readonly<Record<string, unknown>>;
    };

interface ResolveOptions {
  readonly root: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  /** Tests always run against the placeholders unless an env var says otherwise. */
  readonly useLocalFile: boolean;
}

/** The committed placeholder files, read from disk (the build has no bundler here). */
export function readPlaceholders(root: string): Record<string, unknown> {
  const read = (language: string) =>
    JSON.parse(readFileSync(path.join(root, 'src/content', `${language}.json`), 'utf8')) as unknown;
  return { en: read('en'), sv: read('sv') };
}

function parse(text: string, origin: string, root: string, file?: string): SiteContentSource {
  let content: unknown;
  try {
    content = JSON.parse(text);
  } catch {
    // The parser's message quotes the input, so it is not repeated here.
    throw new Error(`Site content from ${origin} is not valid JSON.`);
  }

  const problems = findSiteContentProblems(content, readPlaceholders(root));
  if (problems.length > 0) {
    const list = problems.map((problem) => `  - ${problem}`).join('\n');
    throw new Error(`Site content from ${origin} does not match the site's shape:\n${list}`);
  }

  return {
    kind: 'override',
    origin,
    ...(file ? { file } : {}),
    content: content as Record<string, unknown>,
  };
}

function fromFile(file: string, origin: string, root: string): SiteContentSource {
  if (!existsSync(file)) throw new Error(`Site content file not found: ${origin}`);
  return parse(readFileSync(file, 'utf8'), origin, root, file);
}

export function resolveSiteContent({ root, env, useLocalFile }: ResolveOptions): SiteContentSource {
  const inline = env[CONTENT_ENV]?.trim();
  // An unset secret reaches a workflow as an empty string, which means "not configured".
  if (inline) return parse(inline, `$${CONTENT_ENV}`, root);

  const named = env[CONTENT_FILE_ENV]?.trim();
  if (named) return fromFile(path.resolve(root, named), `$${CONTENT_FILE_ENV} (${named})`, root);

  const local = path.join(root, LOCAL_CONTENT_FILE);
  if (useLocalFile && existsSync(local)) return fromFile(local, LOCAL_CONTENT_FILE, root);

  return { kind: 'placeholder' };
}
