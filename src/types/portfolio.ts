/** Domain model. Nothing here knows about React or the DOM. */

export type Proficiency = 'core' | 'strong' | 'working' | 'exploring';

export interface Skill {
  readonly name: string;
  readonly level: Proficiency;
  /** Optional one-liner shown under the skill name. */
  readonly note?: string;
}

export interface SkillGroup {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly skills: readonly Skill[];
}

export type RoleKind = 'development' | 'quality' | 'leadership' | 'education';

export interface TimelineEntry {
  readonly id: string;
  readonly role: string;
  readonly organisation: string;
  readonly start: string;
  /** Omit for the current position. */
  readonly end?: string;
  readonly kind: RoleKind;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly stack: readonly string[];
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly language: string | null;
  readonly stars: number;
  readonly topics: readonly string[];
  readonly updatedAt: string;
}

export interface ExploreTopic {
  readonly id: string;
  readonly title: string;
  readonly why: string;
  readonly status: 'reading' | 'building' | 'next';
}

export interface Principle {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface ContactChannel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly href: string;
}

export interface Profile {
  readonly name: string;
  readonly githubUser: string;
  readonly roleLine: string;
  readonly location: string;
  readonly availability: string;
  readonly intro: readonly string[];
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly channels: readonly ContactChannel[];
}
