import type { Proficiency, SkillGroup } from '@/types/portfolio';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
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

export function StackMatrix({ groups }: StackMatrixProps) {
  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="What I reach for"
      lead="Honest levels rather than a wall of logos. Daily means I wrote some this week; learning now means I would need a code review."
      surface="raised"
    >
      <ul className={styles.groups}>
        {groups.map((group, groupIndex) => (
          <Reveal
            as="li"
            key={group.id}
            variant="up"
            delay={groupIndex * 80}
            className={styles.group}
          >
            <h3 className={styles.groupTitle}>{group.title}</h3>
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
    </Section>
  );
}
