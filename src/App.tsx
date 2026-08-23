import { SkipLink } from '@/components/SkipLink';
import { Nav } from '@/components/Nav';
import { ScrollSpine } from '@/components/ScrollSpine';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { StackMatrix } from '@/components/StackMatrix';
import { Projects } from '@/components/Projects';
import { Timeline } from '@/components/Timeline';
import { Approach } from '@/components/Approach';
import { Exploring } from '@/components/Exploring';
import { Contact } from '@/components/Contact';
import { useActiveSection } from '@/hooks/useActiveSection';
import { navItems } from '@/data/navigation';
import { profile } from '@/data/profile';
import { skillGroups } from '@/data/skills';
import { timeline } from '@/data/timeline';
import { principles } from '@/data/principles';
import { exploreTopics } from '@/data/explore';
import { heroHeadline, heroStats } from '@/data/hero';

const sectionIds = ['home', ...navItems.map((item) => item.id)];

/**
 * Composition root. It wires data to components and nothing else — every
 * section below is independently testable and reusable.
 */
export default function App() {
  const activeId = useActiveSection(sectionIds, 'home');

  return (
    <>
      <SkipLink targetId="main" />
      <Nav items={navItems} activeId={activeId} brand={profile.name} />
      <ScrollSpine items={navItems} activeId={activeId} />

      <main id="main">
        <Hero
          name={profile.name}
          roleLine={profile.roleLine}
          headline={heroHeadline}
          stats={heroStats}
        />
        <About profile={profile} />
        <StackMatrix groups={skillGroups} />
        <Projects githubUser={profile.githubUser} />
        <Timeline entries={timeline} />
        <Approach principles={principles} />
        <Exploring topics={exploreTopics} />
      </main>

      <Contact profile={profile} />
    </>
  );
}
