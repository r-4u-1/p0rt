import { useMemo } from 'react';
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
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import { useQualityGuard } from '@/hooks/useQualityGuard';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Composition root. It wires content to components and nothing else — every
 * section below is independently testable and reusable.
 *
 * This is also the only place that knows the page has two languages. The
 * store is read once here, and each section is handed the words for its own
 * part in whichever language is current; nothing below this file imports a
 * language file or asks which one is active. Switching language is therefore
 * an ordinary re-render with different props, not a reload and not a route.
 */
export default function App() {
  const { content } = useLanguage();
  const sectionIds = useMemo(
    () => ['home', ...content.nav.map((item) => item.id)],
    [content.nav],
  );
  const activeId = useActiveSection(sectionIds, 'home');

  // Two page-wide measurements, published as attributes and custom
  // properties for any stylesheet to read. Neither owns any markup, which is
  // why they sit here rather than inside a component that happens to use
  // them — scroll speed and frame cost are facts about the page, not about a
  // section of it.
  useScrollVelocity();
  useQualityGuard();

  return (
    <>
      <SkipLink targetId="main" label={content.ui.skipToContent} />
      <Nav
        items={content.nav}
        activeId={activeId}
        brand={content.profile.name}
        ui={content.ui}
      />
      <ScrollSpine items={content.nav} activeId={activeId} label={content.ui.spine.label} />

      <main id="main">
        <Hero profile={content.profile} content={content.hero} />
        <About profile={content.profile} content={content.about} />
        <StackMatrix content={content.stack} />
        <Projects
          content={content.projects}
          githubUser={content.profile.githubUser}
          locale={content.meta.locale}
        />
        <Timeline content={content.journey} />
        <Approach content={content.approach} />
        <Exploring content={content.exploring} />
      </main>

      <Contact profile={content.profile} content={content.contact} />
    </>
  );
}
