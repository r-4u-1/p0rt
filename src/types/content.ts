/**
 * The shape of a language file.
 *
 * Everything the page says out loud lives in `src/content/<language>.json`
 * and reaches a component as a prop. No component imports a language file,
 * and no language file knows a component exists — the same separation the
 * domain data had before, now with two of everything.
 *
 * Each file is complete on its own: it carries the structure (ids, levels,
 * dates, hrefs) as well as the words. That is a deliberate duplication. A
 * translator opening `sv.json` sees the whole Swedish site in one place
 * rather than half of it, and `content.test.ts` fails the build if the two
 * files ever disagree about anything that is not a translation.
 */

import type {
  ContactChannel,
  ExploreTopic,
  Principle,
  Proficiency,
  RoleKind,
  SkillGroup,
  TimelineEntry,
} from './portfolio';

export type Language = 'en' | 'sv';

export interface NavItem {
  readonly id: string;
  readonly label: string;
}

/** Facts about the document itself, applied outside React. */
export interface MetaContent {
  readonly documentTitle: string;
  readonly documentDescription: string;
  /**
   * BCP-47 tag, used for `<html lang>` and for anything the platform
   * formats — dates in particular. Not the same string as the language key:
   * `en` is served as `en-GB`.
   */
  readonly locale: string;
  /** Endonym, shown in the language control. */
  readonly languageName: string;
}

/** Chrome: the controls that frame the content rather than being it. */
export interface UiContent {
  readonly skipToContent: string;
  readonly menu: {
    readonly open: string;
    readonly close: string;
    /** Accessible name of the nav landmark itself. */
    readonly sectionsLabel: string;
  };
  readonly spine: {
    readonly label: string;
  };
  readonly motion: {
    readonly label: string;
    readonly turnOn: string;
    readonly turnOff: string;
  };
  readonly language: {
    readonly label: string;
    /** Accessible name of the toggle: what pressing it will do. */
    readonly switchTo: string;
  };
}

/** Identity shared by several sections, so it is written once per language. */
export interface ProfileContent {
  readonly name: string;
  readonly githubUser: string;
  readonly roleLine: string;
  readonly location: string;
  readonly availability: string;
}

export interface HeroStat {
  readonly label: string;
  readonly value: string;
}

export interface HeroContent {
  /** One entry per line; the stylesheet shears them apart individually. */
  readonly headline: readonly string[];
  readonly stats: readonly HeroStat[];
  readonly readOn: string;
  readonly gaugeLabel: string;
}

/** Every section leads with the same three strings. */
export interface SectionHeading {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
}

export interface Fact {
  readonly label: string;
  readonly value: string;
}

export interface AboutContent extends SectionHeading {
  readonly intro: readonly string[];
  readonly factsTitle: string;
  readonly facts: readonly Fact[];
}

export interface StackContent extends SectionHeading {
  /** The words the bars are a second opinion on. */
  readonly levels: Record<Proficiency, string>;
  readonly groups: readonly SkillGroup[];
  readonly readoutLabel: string;
  /** Rendered as `{n} {groupsSuffix}`. */
  readonly groupsSuffix: string;
  /** Accessible name of the rail when it is a real scroll container. */
  readonly railLabel: string;
}

/** English and Swedish share one plural rule, so two forms is the honest shape. */
export interface Plural {
  readonly one: string;
  readonly other: string;
}

export interface ProjectsContent extends SectionHeading {
  readonly loading: string;
  /** Rendered as `{n} {ready.one|other}`. */
  readonly ready: Plural;
  /**
   * Appended after the reason GitHub gave. The reason itself stays in the
   * language GitHub sent it in — a translated guess at someone else's error
   * is worse than an untranslated fact.
   */
  readonly fallbackSuffix: string;
  readonly error: string;
  /** Contains `{link}`, replaced by the profile link. */
  readonly browseAt: string;
  readonly allRepositories: string;
  readonly opensOnGitHub: string;
  readonly updated: string;
  readonly stars: Plural;
}

export interface JourneyContent extends SectionHeading {
  /** Stands in for a missing end date. */
  readonly present: string;
  readonly kinds: Record<RoleKind, string>;
  /** Contains `{role}`. */
  readonly toolsLabel: string;
  readonly entries: readonly TimelineEntry[];
}

export interface ApproachContent extends SectionHeading {
  readonly principles: readonly Principle[];
}

export interface ExploringContent extends SectionHeading {
  readonly statuses: Record<ExploreTopic['status'], string>;
  readonly topics: readonly ExploreTopic[];
}

export interface ContactContent {
  readonly eyebrow: string;
  readonly title: string;
  /** Follows availability and location, which come from the profile. */
  readonly lead: string;
  readonly channels: readonly ContactChannel[];
  readonly colophon: string;
  readonly backToTop: string;
}

export interface SiteContent {
  readonly language: Language;
  readonly meta: MetaContent;
  readonly ui: UiContent;
  readonly profile: ProfileContent;
  readonly nav: readonly NavItem[];
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly stack: StackContent;
  readonly projects: ProjectsContent;
  readonly journey: JourneyContent;
  readonly approach: ApproachContent;
  readonly exploring: ExploringContent;
  readonly contact: ContactContent;
}
