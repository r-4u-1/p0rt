/**
 * Structural check for site content that did not come from this repository.
 *
 * The committed `en.json` and `sv.json` are placeholders; the real site can be
 * injected at build time (see `config/siteContent.ts`). That content never
 * passes the compiler, so this compares it against the placeholders instead:
 * every field the placeholders always have must exist, with the same kind of
 * value, and no string may be empty.
 *
 * Problems are reported as paths only, never values. The build log of a
 * public repository is public, and the point of injecting content is that it
 * is not in the repository.
 */

type Kind = 'array' | 'object' | 'string' | 'number' | 'boolean' | 'null';

/** Marks a place where the placeholders disagree with each other, so anything goes. */
const ANY = Symbol('any');

function kindOf(value: unknown): Kind {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'object' ? 'object' : (typeof value as Kind);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return kindOf(value) === 'object';
}

/**
 * Folds several example values into one reference.
 *
 * A key only some examples have is optional (a timeline entry without an
 * `end`), so it is left out; a key whose kind varies between examples is
 * accepted as anything.
 */
function merge(values: readonly unknown[]): unknown {
  const [first] = values;
  const kind = kindOf(first);
  if (values.some((value) => kindOf(value) !== kind)) return ANY;

  if (kind === 'array') {
    const items = (values as unknown[][]).flat();
    return items.length > 0 ? [merge(items)] : [];
  }

  if (kind === 'object') {
    const records = values as Record<string, unknown>[];
    const shared = Object.keys(records[0] ?? {}).filter((key) =>
      records.every((record) => key in record),
    );
    return Object.fromEntries(shared.map((key) => [key, merge(records.map((r) => r[key]))]));
  }

  return first;
}

function shapeProblems(candidate: unknown, reference: unknown, path: string): string[] {
  if (reference === ANY) return [];

  const expected = kindOf(reference);
  const actual = kindOf(candidate);
  if (actual !== expected) return [`${path}: expected ${expected}, found ${actual}`];

  if (Array.isArray(reference) && Array.isArray(candidate)) {
    const [sample] = reference;
    if (sample === undefined) return [];
    return candidate.flatMap((item, index) => shapeProblems(item, sample, `${path}[${index}]`));
  }

  if (isRecord(reference) && isRecord(candidate)) {
    return Object.entries(reference).flatMap(([key, value]) =>
      key in candidate
        ? shapeProblems(candidate[key], value, `${path}.${key}`)
        : [`${path}.${key}: missing`],
    );
  }

  if (typeof candidate === 'string' && candidate.trim() === '') return [`${path}: empty`];
  return [];
}

/**
 * Checks a combined `{ "en": {...}, "sv": {...} }` document against the
 * placeholder files. An empty list means it is safe to build with.
 */
export function findSiteContentProblems(
  candidate: unknown,
  placeholders: Readonly<Record<string, unknown>>,
): string[] {
  if (!isRecord(candidate)) {
    return [`(root): expected an object keyed by language (${Object.keys(placeholders).join(', ')})`];
  }

  const reference = merge(Object.values(placeholders));
  const problems = Object.keys(candidate)
    .filter((key) => !(key in placeholders))
    .map((key) => `${key}: not a language this site has`);

  for (const language of Object.keys(placeholders)) {
    const file = candidate[language];
    if (file === undefined) {
      problems.push(`${language}: missing`);
      continue;
    }
    problems.push(...shapeProblems(file, reference, language));
    if (isRecord(file) && file['language'] !== language) {
      problems.push(`${language}.language: must be "${language}"`);
    }
  }

  return problems;
}
