# Developer portfolio

A single-page portfolio built with React, TypeScript and CSS Modules. Scroll-driven
animation throughout, working the same way under a finger as under a mouse wheel, and
switching itself off entirely when the visitor asks for reduced motion.

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## Make it yours

Everything personal lives in `src/data/`. No component needs editing.

| File | What it holds |
| --- | --- |
| `profile.ts` | Name, GitHub handle, intro, quick facts, contact links |
| `hero.ts` | The landing headline and the three status readouts |
| `skills.ts` | Skill groups and honest proficiency levels |
| `timeline.ts` | Employment and education history, newest first |
| `principles.ts` | The "how I work" section |
| `explore.ts` | What you are learning next |
| `navigation.ts` | Section order — drives the nav, the spine and the page |

Start with `profile.ts`: replace `name`, `githubUser` and the three `channels`. The project
list will then populate itself from your real GitHub account. Also update the `<title>`,
description and `noscript` fallback in `index.html`.

---

## Architecture

```
src/
├── components/          one folder per component: .tsx + .module.css + index.ts (+ .test.tsx)
│   ├── Nav/             animated menu — inline bar on desktop, full panel on mobile
│   ├── Hero/            pinned landing scene — scroll scrubs the headline apart
│   ├── ScrollSpine/     the signature element: reading progress + section markers
│   ├── Reveal/          shared scroll-into-view wrapper used by every section
│   ├── Section/         layout primitive: rhythm, landmark, heading association
│   ├── Icon/            inline SVG set + the draw-on animation
│   ├── CanvasScene/     host for the canvas art; owns the element, not the drawing
│   ├── Projects/        container + ProjectCard/ presentation child
│   ├── Timeline/        animated history + TimelineItem/ child
│   └── …                About, StackMatrix, Approach, Exploring, Contact, SkipLink
├── art/                 canvas scenes as pure functions of state and time
├── hooks/               useInView, useScrollScene, useScrollProgress, useCanvasScene…
├── services/            data sources behind an interface
├── data/                all editable content
├── types/               domain model — no React, no DOM
└── test/                observer mock, fake 2D context, fakes, render helper
```

### SOLID in practice

**Single responsibility** — `Reveal` reveals, `useProjects` owns loading state, `ProjectCard`
renders one project. `mapRepo.ts` exists purely to translate GitHub's payload into the domain
shape, so a change to their API touches one file.

**Open/closed** — adding a GitLab source means writing a new class that implements
`ProjectSource` and registering it in the provider. No component changes.

**Liskov** — `GitHubProjectSource`, `StaticProjectSource` and the test's `FakeProjectSource`
are interchangeable. The fallback path in `useProjects` swaps one for another at runtime.

**Interface segregation** — components take narrow, readonly props describing exactly what
they render. `Timeline` receives entries; it does not receive the whole profile.

**Dependency inversion** — `Projects` depends on the `ProjectSource` interface, resolved from
context. Production wires GitHub, tests wire a fake, Percy wires a stubbed route. Nothing in
the component tree imports `fetch`.

---

## Motion

Every section moves differently, because a page where each section fades up in turn
is one idea repeated seven times. The vocabulary is shared; the choreography is not.

| Section | Axis | What moves |
| --- | --- | --- |
| Hero | pinned scrub | the headline shears apart, the floor tips over, the integrity gauge drains |
| About | horizontal | prose and facts card counter-scroll; a hairline sweeps down the card |
| Stack | **horizontal** | four panels traverse a pinned rail, each one's bars filling as it arrives |
| Projects | vertical | grid columns drift at three rates; a highlight follows the cursor |
| Journey | vertical | a charge rides the track; entries alternate in; crows cross the sky |
| Approach | horizontal | each row's rule draws left to right as the row is revealed |
| Exploring | vertical | a shallow arc across each row, over falling telemetry |
| Contact | horizontal | a fill wipes across the row and the address rides in on it |

### The four primitives

- `useInView` — IntersectionObserver, used by `Reveal` and each timeline entry.
  Touch-friendly by construction, since it never listens to scroll.
- `useScrollScene` — writes `--scene` (0 → 1 through a **pinned** section) and lets CSS
  choreograph from that one number. Drives the hero and the Stack rail.
- `useScrollProgress` — writes `--progress` and `--drift` (-1 → 0 → 1) for an **ordinary**
  section crossing the viewport. Counter-scrolling two columns is then a sign flip
  rather than two separate measurements.
- `useSectionProgress` — reading progress as 0→1, driving the spine. Measured in
  *section* space, not document space: the spine spaces its markers evenly, so raw
  scroll position would run a fifth of the rail ahead of them over the pinned hero alone.

All four are coalesced to one write per animation frame by `useRafCallback`.

### The horizontal section

`StackMatrix` pins for one viewport and pushes its rail sideways. The travel is
`translate3d(calc(var(--scene) * (var(--visible) - 100%)), 0, 0)` — percentage transforms
resolve against the element's own width, so `100%` is the rail: the overhang needs no
measurement in JS and stays correct when a group is added to the data. It only pins above
1000×660 with motion allowed; everywhere else the same markup is a responsive grid.

Pinning is safe here precisely because nothing in those panels is focusable. A link inside
a scroll-driven translation is a trap — tabbing to it moves focus somewhere the browser
cannot scroll into view. If the section ever gains one, the horizontal mode has to go.

### Canvas art

Two scenes in `src/art/`: a flock of crows crossing the Journey sky, and falling telemetry
behind Exploring. They are plain functions of state and time — no React, no DOM, no
observers — which is why they are unit-tested against a recording 2D context rather than
eyeballed. `useCanvasScene` owns every reason a canvas should *stop*: off screen, hidden
tab, finished, or reduced motion. The crows re-seed per run, so scrolling back gives you a
different flock rather than a replay.

The rain ages its trails by painting the background over itself at low alpha — one
`fillRect` and two `fillText` per column, instead of redrawing every glyph of every trail.
Below 700px it is `display: none`, which is also the off switch for the loop, since a
box-less element never intersects.

### Icons

`src/components/Icon/paths.ts` holds hand-drawn geometry on a 24 grid. Every shape carries
`pathLength="1"`, which normalises the dash geometry: one `stroke-dasharray: 1` rule then
animates a short tick and a long shield outline at the same visual rate, with nothing to
re-tune when a path changes. Dropping in an icon from elsewhere is a copy of its `d`
attributes into a new entry; the page's motion applies to it for free.

### Reduced motion, and the switch you never see

Every duration is multiplied by `var(--motion)`, which
`@media (prefers-reduced-motion: reduce)` sets to `0`. One switch, whole page: the canvases
render nothing at all, the pinned runways collapse to a single screen, and the document is
9 300px instead of 12 100.

The second switch is a repair. `useInView` treats silence from the observer as a failure
rather than as "not yet": if nothing reports within 1.6s it reveals anyway and flags the
document, and one rule in `global.css` drops every duration to zero. Without it, any
environment that renders but does not animate — a background tab, a prerender, a headless
screenshotter — gets the whole page at `opacity: 0`, with nothing in the console to say why.

## Testing

```bash
npm test              # Jest + Testing Library
npm run test:coverage # with thresholds
npm run e2e           # Playwright functional journeys (desktop + mobile)
npm run percy         # Percy visual regression — needs PERCY_TOKEN
```

**185 unit and component tests** covering menu behaviour and focus return, reveal states
and the reveal failsafe, project loading/fallback/error paths, timeline rendering, GitHub
response mapping and filtering, scroll-progress maths and listener cleanup, pointer
delegation, canvas lifecycle (in view, hidden tab, finished, replay, reduced motion), and
the art itself — that the flock crosses the frame and reports itself finished, and that
the rain steps by row and never runs off the edge.

**Accessibility** is asserted, not assumed: `jest-axe` runs against every section and the
whole composed page, alongside explicit checks for landmarks, a single `h1`, `aria-expanded`,
`aria-current`, Escape handling and skip-link tab order. Two nested-landmark violations were
caught by these tests during the build and fixed.

**Percy** (`e2e/visual.percy.spec.ts`) snapshots seven flows at 375, 768 and 1440 px:
landing, scrolled-past-hero, projects loaded, timeline revealed, contact, mobile menu open,
and the GitHub-unavailable fallback. `.percy.yml` freezes all animation so snapshots are
deterministic. GitHub is stubbed via `page.route`, so a rate limit can never fail a build.

---

## Deployment

Push to `main` and `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.

1. **Settings → Pages → Source → GitHub Actions**
2. Add `PERCY_TOKEN` under **Settings → Secrets → Actions** if you want visual regression
3. Push

The workflow sets `VITE_BASE` from the repository name, so the site works at
`https://<user>.github.io/<repo>/` with no config edit. Using a custom domain or a
`<user>.github.io` repo? Drop the `VITE_BASE` env block and it builds at `/`.

| Workflow | Trigger | Does |
| --- | --- | --- |
| `ci.yml` | push + PR | typecheck, lint, tests with coverage, Playwright journeys |
| `deploy.yml` | push to main | test, build, publish to Pages |
| `percy.yml` | push + PR | build and snapshot flows (skipped on forks) |

---

## Performance and accessibility notes

- React is split into its own chunk; the app bundle is ~50 kB before gzip.
- Scroll work is `transform` and `opacity` only, batched with `requestAnimationFrame`.
- Canvases stop dead when off screen, in a hidden tab, finished, or hidden by CSS.
- Sections carry `overflow-x: clip`, so an entrance offset cannot grow the document's
  horizontal scroll range. `clip` rather than `hidden`, which would make every section a
  scroll container and break the sticky rail pinned inside one.
- No `background-attachment: fixed`, which breaks on iOS Safari.
- Focus is visible everywhere and re-targeted when the mobile menu closes.
- The decorative spine is `aria-hidden`; the nav carries the real links.
- Fonts load with `display=swap` behind `preconnect`.
