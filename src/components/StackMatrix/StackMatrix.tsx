import type { Proficiency, SkillGroup } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useScrollScene } from '@/hooks/useScrollScene';
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
 * The one section that moves sideways.
 *
 * On a wide screen the four groups sit on a rail that is pushed left as the
 * section scrolls past, so reading the stack is a lateral traverse rather
 * than another column of cards — and the proficiency bars fill *as their
 * panel arrives* instead of all at once, which turns the scroll itself into
 * the readout.
 *
 * It is safe to pin precisely because nothing in here is focusable: the
 * panels are headings, text and bars. A link inside a scroll-driven
 * translation is a trap — tabbing to it would move focus somewhere the
 * browser cannot scroll into view. If this section ever gains a link, the
 * horizontal mode has to go.
 *
 * Below 1000px wide or 640px tall, and under reduced motion, it is an
 * ordinary responsive grid. The runway is `var(--motion)`-scaled, so the
 * pinning disappears with it rather than trapping a visitor in a dead
 * scroll region.
 */
export function StackMatrix({ groups }: StackMatrixProps) {
  const railRef = useScrollScene<HTMLDivElement>();

  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="What I reach for"
      lead="Honest levels rather than a wall of logos. Daily means I wrote some this week; learning now means I would need a code review."
      surface="raised"
    >
      <div ref={railRef} className={styles.runway}>
        <div className={styles.viewport}>
          {/*
            A sideways section has to announce itself. The readout doubles as
            the affordance ("this moves") and the position ("you are here"),
            which is the honest version of a scroll hint — it is the same
            instrument language as the spine and the hero's integrity gauge.
            Hidden in the grid layout, where there is nothing to traverse.
          */}
          <p className={styles.readout} aria-hidden="true">
            <span className={styles.readoutLabel}>Stack</span>
            <span className={styles.readoutRail}>
              <span className={styles.readoutFill} />
            </span>
            <span className={styles.readoutCount}>{groups.length} groups · scroll to traverse</span>
          </p>

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
      </div>
    </Section>
  );
}
