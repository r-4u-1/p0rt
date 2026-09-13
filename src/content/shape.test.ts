import defaultContent from './defaultContent';
import { findSiteContentProblems } from './shape';

/*
 * Injected content is checked against the placeholders, so these tests build
 * candidates by copying the placeholders and breaking one thing at a time.
 */

type Json = Record<string, unknown>;

const placeholders = defaultContent as unknown as Json;
const copy = (): { en: Json; sv: Json } => JSON.parse(JSON.stringify(defaultContent));

describe('findSiteContentProblems', () => {
  it('accepts the placeholders themselves', () => {
    expect(findSiteContentProblems(copy(), placeholders)).toEqual([]);
  });

  it('accepts different words in the same shape', () => {
    const candidate = copy();
    (candidate.en['profile'] as Json)['name'] = 'Someone Real';
    (candidate.sv['hero'] as Json)['headline'] = ['En rad', 'till', 'och en till', 'och en fjärde'];
    expect(findSiteContentProblems(candidate, placeholders)).toEqual([]);
  });

  it('rejects something that is not an object keyed by language', () => {
    expect(findSiteContentProblems([], placeholders)).toEqual([
      '(root): expected an object keyed by language (en, sv)',
    ]);
    expect(findSiteContentProblems('{}', placeholders)).toHaveLength(1);
  });

  it('names a missing language and one the site does not have', () => {
    const { en } = copy();
    expect(findSiteContentProblems({ en, de: en }, placeholders)).toEqual([
      'de: not a language this site has',
      'sv: missing',
    ]);
  });

  it('catches a single-language file pasted where both belong', () => {
    const problems = findSiteContentProblems(copy().en, placeholders);
    expect(problems).toContain('en: missing');
    expect(problems).toContain('sv: missing');
  });

  it('points at a missing field by its path', () => {
    const candidate = copy();
    delete (candidate.sv['contact'] as Json)['colophon'];
    expect(findSiteContentProblems(candidate, placeholders)).toEqual(['sv.contact.colophon: missing']);
  });

  it('points inside arrays, at the item that is wrong', () => {
    const candidate = copy();
    const nav = candidate.en['nav'] as Json[];
    delete nav[2]?.['label'];
    expect(findSiteContentProblems(candidate, placeholders)).toEqual(['en.nav[2].label: missing']);
  });

  it('rejects the wrong kind of value and empty strings', () => {
    const candidate = copy();
    (candidate.en['hero'] as Json)['headline'] = 'one line';
    (candidate.sv['meta'] as Json)['documentTitle'] = '   ';
    expect(findSiteContentProblems(candidate, placeholders)).toEqual([
      'en.hero.headline: expected array, found string',
      'sv.meta.documentTitle: empty',
    ]);
  });

  it('requires each file to declare the language it is filed under', () => {
    const candidate = copy();
    candidate.sv['language'] = 'en';
    expect(findSiteContentProblems(candidate, placeholders)).toEqual([
      'sv.language: must be "sv"',
    ]);
  });

  it('treats a field only some placeholder items have as optional', () => {
    const reference = { en: { list: [{ id: 'a', end: 'x' }, { id: 'b' }] }, sv: { list: [] } };
    const candidate = { en: { list: [{ id: 'c' }] }, sv: { list: [{ id: 'd', end: 'y' }] } };
    expect(findSiteContentProblems(candidate, reference)).toEqual([
      'en.language: must be "en"',
      'sv.language: must be "sv"',
    ]);
  });

  it('never quotes the content in what it reports', () => {
    const candidate = copy();
    (candidate.en['profile'] as Json)['name'] = 42;
    const [problem] = findSiteContentProblems(candidate, placeholders);
    expect(problem).toBe('en.profile.name: expected string, found number');
  });
});
