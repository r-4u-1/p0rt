import type { Proficiency, SkillGroup } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useScrollScene } from '@/hooks/useScrollScene';
import { useScrollerProgress } from '@/hooks/useScrollerProgress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import styles from './StackMatrix.module.css';

export interface StackMatrixProps {
  readonly groups: readonly SkillGroup[];
}

/** How confident I am, in words first and a bar second. */
const LEVEL_COPY: Record<Proficiency, { label: string; fill: number }> = {
  core: { label: 'Daily', fill: 1 },
  strong: { label: 'Confident', fill: 0.78 },
  working: { label: 'Working knowledge', fill: 0.55 },
  exploring: { label: 'Learning now', fill: 0.32 },
};

/** Keyed by group id, so adding a group is a data change plus one line here. */
const GROUP_ICON: Record<string, IconName> = {
  languages: 'braces',
  building: 'layers',
  quality: 'shieldCheck',
  ai: 'cpu',
};

/**
 * Must agree with the pinned block in the stylesheet.
 *
 * Height, not width: the pinned traverse needs a viewport that can hold a
 * panel and its readout at once, which a phone held upright can and a phone
 * turned sideways cannot. Exported because the tests assert the behaviour
 * that hangs off it, and a second copy of the query is a second thing to
 * forget when this one moves.
 */
export const PINNABLE = '(min-height: 640px)';

/**
 * The one section that moves sideways — on every device.
 *
 * The rail is the idea, so the rail is the *base* layout: a native
 * scroll-snap track that a thumb swipes, a trackpad flicks and a keyboard
 * scrolls. Wherever the screen is tall enough to frame a panel and motion is
 * allowed, that rail is enhanced into a pinned scrub, where vertical scroll
 * drives the traverse and each panel's bars fill as it arrives.
 *
 * The enhancement is not a desktop luxury. On a phone the swipe rail is
 * reachable but unused: nobody stops scrolling a page to try a sideways
 * gesture on a section they have not read yet, and a panel taller than the
 * screen means the thumb that scrolls past reads part of one group and never
 * learns the other three are there. Driving the traverse from the scroll the
 * reader is already doing is what makes the section visible at all — so the
 * gate is height, which is about whether a panel fits, not width, which was
 * only ever a proxy for it.
 *
 * It is safe to pin precisely because nothing in here is focusable: the
 * panels are headings, text and bars. A link inside a scroll-driven
 * translation is a trap — tabbing to it would move focus somewhere the
 * browser cannot scroll into view. If this section ever gains a link, the
 * pinned mode has to go; the scroll-snap rail would still be fine.
 */
export function StackMatrix({ groups }: StackMatrixProps) {
  const runwayRef = useScrollScene<HTMLDivElement>();
  const railRef = useScrollerProgress<HTMLDivElement>();
  const tallEnough = useMediaQuery(PINNABLE);
  const { reduced } = useMotionPreference();

  // When pinned, the rail is driven by page scroll and is not itself
  // scrollable, so it must not be a tab stop. When it is a real scroll
  // container it must be, or its content is unreachable by keyboard.
  const pinned = tallEnough && !reduced;

  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="What I reach for"
      lead="Honest levels rather than a wall of logos. Daily means I wrote some this week; learning now means I would need a code review."
      surface="raised"
    >
      <div ref={runwayRef} className={styles.runway} data-pinned={pinned ? 'true' : 'false'}>
        <div className={styles.stage}>
          <div
            ref={railRef}
            className={styles.rail}
            tabIndex={pinned ? undefined : 0}
            role={pinned ? undefined : 'group'}
            aria-label={pinned ? undefined : 'Skill groups, scrolls sideways'}
          >
            <ul className={styles.track}>
              {groups.map((group, groupIndex) => (
                <Reveal
                  as="li"
                  key={group.id}
                  variant="up"
                  delay={groupIndex * 80}
                  className={styles.group}
                  style={{ '--panel-index': groupIndex } as React.CSSProperties}
                >
                  {/* The icon lives inside the heading rather than beside it:
                      a sibling layout wrapper would have to be a <p>, and the
                      group would stop being a heading in the outline. */}
                  <h3 className={styles.groupHead}>
                    <Icon
                      name={GROUP_ICON[group.id] ?? 'layers'}
                      size={22}
                      motion="trace"
                      className={styles.groupIcon}
                    />
                    {group.title}
                  </h3>
                  <p className={styles.groupCaption}>{group.caption}</p>

                  <ul className={styles.skills}>
                    {group.skills.map((skill, skillIndex) => {
                      const level = LEVEL_COPY[skill.level];
                      return (
                        <li
                          key={skill.name}
                          className={styles.skill}
                          style={
                            {
                              '--fill': level.fill,
                              '--skill-index': skillIndex,
                            } as React.CSSProperties
                          }
                        >
                          <div className={styles.skillHead}>
                            <span className={styles.skillName}>{skill.name}</span>
                            <span className={styles.skillLevel} data-level={skill.level}>
                              {level.label}
                            </span>
                          </div>
                          {skill.note ? <p className={styles.skillNote}>{skill.note}</p> : null}
                          <span className={styles.bar} aria-hidden="true">
                            <span className={styles.barFill} data-level={skill.level} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              ))}
            </ul>
          </div>

          {/*
            One readout for both modes. The stylesheet points `--traverse` at
            `--rail` (thumb) or `--scene` (pinned scrub), so this never learns
            which one is driving it.
          */}
          <p className={styles.readout} aria-hidden="true">
            <span className={styles.readoutLabel}>Stack</span>
            <span className={styles.readoutRail}>
              <span className={styles.readoutFill} />
            </span>
            <span className={styles.readoutCount}>{groups.length} groups</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
