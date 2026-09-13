import { DEFAULT_LANGUAGE, content, contentFor, isLanguage, languages, nextLanguage } from '.';
import type { Language, SiteContent } from '@/types/content';

/*
 * The language files are JSON, and `resolveJsonModule` widens every string in
 * them to `string`. That means the compiler cannot tell a `level` of "core"
 * from a `level` of "cor", and cannot notice that a group was added to one
 * language and forgotten in the other. This file is the check that can.
 *
 * Two kinds of assertion live here, and the difference matters:
 *
 *   - *Shape*: every enum-like value is one the union allows. A typo here is
 *     a bar that never fills or an icon that falls back silently.
 *   - *Parity*: the two files describe the same site. Words differ; ids,
 *     levels, dates, hrefs and counts must not. Translation drift is the
 *     failure mode of every two-file setup, and it is invisible until
 *     someone reads the page in the language nobody on the team reads.
 */

const PROFICIENCIES = ['core', 'strong', 'working', 'exploring'];
const ROLE_KINDS = ['development', 'quality', 'leadership', 'education'];
const TOPIC_STATUSES = ['reading', 'building', 'next'];

/** Every string a language file holds, flattened, so none can be left empty. */
function strings(value: unknown, path = ''): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      strings(item, path ? `${path}.${key}` : key),
    );
  }
  return [[path, value]];
}

describe('the language files', () => {
  const entries = Object.entries(content) as [Language, SiteContent][];

  it.each(entries)('%s declares its own language key', (language, file) => {
    expect(file.language).toBe(language);
    expect(isLanguage(file.language)).toBe(true);
  });

  it.each(entries)('%s says something in every field it defines', (_language, file) => {
    for (const [path, value] of strings(file)) {
      expect(typeof value === 'string' ? value.trim() : value).not.toBe('');
      expect(value).not.toBeNull();
      expect(path).not.toBe('');
    }
  });

  it.each(entries)('%s uses only proficiency levels the bars can draw', (_language, file) => {
    const levels = file.stack.groups.flatMap((group) => group.skills.map((s) => s.level));
    levels.forEach((level) => expect(PROFICIENCIES).toContain(level));
    expect(Object.keys(file.stack.levels).sort()).toEqual([...PROFICIENCIES].sort());
  });

  it.each(entries)('%s uses only role kinds the timeline has an icon for', (_language, file) => {
    file.journey.entries.forEach((entry) => expect(ROLE_KINDS).toContain(entry.kind));
    expect(Object.keys(file.journey.kinds).sort()).toEqual([...ROLE_KINDS].sort());
  });

  it.each(entries)('%s uses only topic statuses the cards can label', (_language, file) => {
    file.exploring.topics.forEach((topic) => expect(TOPIC_STATUSES).toContain(topic.status));
    expect(Object.keys(file.exploring.statuses).sort()).toEqual([...TOPIC_STATUSES].sort());
  });

  /*
   * Both placeholders are filled by a component rather than by a translator,
   * so losing one in translation loses a link or a name with no other sign.
   */
  it.each(entries)('%s keeps the placeholders the components fill', (_language, file) => {
    expect(file.projects.browseAt).toContain('{link}');
    expect(file.journey.toolsLabel).toContain('{role}');
  });

  it.each(entries)('%s names a locale that the platform can format with', (_language, file) => {
    expect(() => new Intl.DateTimeFormat(file.meta.locale)).not.toThrow();
    expect(file.meta.locale.startsWith(file.language)).toBe(true);
  });

  it.each(entries)('%s links every contact channel to a real destination', (_language, file) => {
    file.contact.channels.forEach((channel) => {
      expect(channel.href).toMatch(/^(https:|mailto:)/);
    });
  });
});

describe('the two languages describe the same site', () => {
  const { en, sv } = content;

  it('offers the same sections in the same order', () => {
    expect(sv.nav.map((item) => item.id)).toEqual(en.nav.map((item) => item.id));
  });

  it('gives the hero the same number of lines and readouts', () => {
    expect(sv.hero.headline).toHaveLength(en.hero.headline.length);
    expect(sv.hero.stats).toHaveLength(en.hero.stats.length);
  });

  it('agrees on identity, which is not a translation', () => {
    expect(sv.profile.name).toBe(en.profile.name);
    expect(sv.profile.githubUser).toBe(en.profile.githubUser);
  });

  it('keeps the same skills at the same levels', () => {
    expect(sv.stack.groups.map((group) => group.id)).toEqual(
      en.stack.groups.map((group) => group.id),
    );
    en.stack.groups.forEach((group, index) => {
      const other = sv.stack.groups[index];
      expect(other?.skills.map((skill) => skill.level)).toEqual(
        group.skills.map((skill) => skill.level),
      );
    });
  });

  /*
   * A job that ran to 2020 in English cannot have ended in 2021 in Swedish,
   * and a tool is called what it is called in both.
   */
  it('keeps the same jobs, dates, kinds and tools', () => {
    expect(sv.journey.entries.map((entry) => entry.id)).toEqual(
      en.journey.entries.map((entry) => entry.id),
    );
    en.journey.entries.forEach((entry, index) => {
      const other = sv.journey.entries[index];
      expect(other?.start).toBe(entry.start);
      expect(other?.end).toBe(entry.end);
      expect(other?.kind).toBe(entry.kind);
      expect(other?.stack).toEqual(entry.stack);
      expect(other?.highlights).toHaveLength(entry.highlights.length);
    });
  });

  it('keeps the same principles and topics, at the same statuses', () => {
    expect(sv.approach.principles.map((p) => p.id)).toEqual(en.approach.principles.map((p) => p.id));
    expect(sv.exploring.topics.map((t) => [t.id, t.status])).toEqual(
      en.exploring.topics.map((t) => [t.id, t.status]),
    );
  });

  it('points both languages at the same contact details', () => {
    expect(sv.contact.channels.map((channel) => [channel.id, channel.value, channel.href])).toEqual(
      en.contact.channels.map((channel) => [channel.id, channel.value, channel.href]),
    );
  });

  it('says the same things about me in both, in different words', () => {
    expect(sv.about.intro).toHaveLength(en.about.intro.length);
    expect(sv.about.facts.map((fact) => fact.value)).toHaveLength(en.about.facts.length);
    expect(sv.about.title).not.toBe(en.about.title);
  });
});

describe('choosing a language', () => {
  it('defaults to English', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(contentFor(DEFAULT_LANGUAGE).language).toBe('en');
  });

  it('recognises the languages it ships and nothing else', () => {
    languages.forEach((language) => expect(isLanguage(language)).toBe(true));
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(null)).toBe(false);
    expect(isLanguage('')).toBe(false);
  });

  it('cycles back round rather than running out', () => {
    let language = DEFAULT_LANGUAGE;
    for (let step = 0; step < languages.length; step += 1) language = nextLanguage(language);
    expect(language).toBe(DEFAULT_LANGUAGE);
  });
});
