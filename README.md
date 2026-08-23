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
│   ├── Projects/        container + ProjectCard/ presentation child
│   ├── Timeline/        animated history + TimelineItem/ child
│   └── …                About, StackMatrix, Approach, Exploring, Contact, SkipLink
├── hooks/               useInView, useScrollScene, useScrollProgress, useActiveSection…
├── services/            data sources behind an interface
├── data/                all editable content
├── types/               domain model — no React, no DOM
└── test/                observer mock, fakes, render helper
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

Three primitives cover every effect on the page:

- `useInView` — IntersectionObserver, used by `Reveal` and each timeline entry. Touch-friendly
  by construction, since it never listens to scroll.
- `useScrollScene` — writes `--scene` (0 → 1 progress through a pinned section) to the
  element and lets CSS choreograph the whole scene from that one number. Coalesced to one
  write per animation frame. The hero's break-apart sequence runs entirely on it.
- `useScrollProgress` — document progress as 0→1, driving the spine.

Every transition duration is multiplied by `var(--motion)`, which
`@media (prefers-reduced-motion: reduce)` sets to `0`. One switch, whole page.

---

## Testing

```bash
npm test              # Jest + Testing Library
npm run test:coverage # with thresholds
npm run e2e           # Playwright functional journeys (desktop + mobile)
npm run percy         # Percy visual regression — needs PERCY_TOKEN
```

**85 unit and component tests** covering menu behaviour and focus return, reveal states,
project loading/fallback/error paths, timeline rendering, GitHub response mapping and
filtering, scroll-progress maths and listener cleanup.

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

- React is split into its own chunk; the app bundle is ~37 kB before gzip.
- Scroll work is `transform` and `opacity` only, batched with `requestAnimationFrame`.
- No `background-attachment: fixed`, which breaks on iOS Safari.
- Focus is visible everywhere and re-targeted when the mobile menu closes.
- The decorative spine is `aria-hidden`; the nav carries the real links.
- Fonts load with `display=swap` behind `preconnect`.
