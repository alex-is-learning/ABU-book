---
workflowType: 'architecture'
project_name: 'A/B/U Interactive Book'
user_name: 'Alex'
date: '2026-04-14'
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
lastStep: 8
status: 'complete'
completedAt: '2026-04-14'
inputDocuments:
  - '_bmad-output/planning/prd-website-book-mvp.md'
  - '_bmad-output/planning/prd-website-book-full-vision.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-30-2100.md'
---

# Architecture Decision Document — A/B/U Interactive Book (MVP)

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

18 FRs across 4 categories:

- *Reading & Navigation (FR1–FR6):* Section display with embedded GIF, A/B routing to advance, U routing to scaffold or stub, position tracking, back-navigation, localStorage persistence.
- *Adaptive Scaffolding (FR7–FR9):* Single scaffold level per main section at MVP; stub message when no scaffold exists; return to main path after A/B on scaffold.
- *Content Authoring (FR10–FR15):* Markdown files rendered client-side via marked.js (CDN); content.json drives all branching config; GIFs embedded by iframe reference; push-to-deploy via GitHub Pages with no build step.
- *Accessibility & Platform (FR16–FR18):* Chrome/Firefox/Safari/Edge last 2 versions; WebGL text fallback for GIFs; keyboard-accessible A/B/U controls.

**Non-Functional Requirements:**

- Performance: 3s section load, <200ms button response, GIFs non-blocking to text display.
- Scalability: Content graph must support 50+ sections and 3 scaffold levels without refactor.
- Accessibility: WCAG 2.1 AA — keyboard operability, screen reader compatibility, colour contrast (4.5:1), no flashing content (WCAG 2.3.1).
- Deploy: Push to GitHub `main` → GitHub Pages auto-deploys; no build command.

**Scale & Complexity:**

- Primary domain: Static web app (browser-only, no backend)
- Complexity level: Low
- Estimated architectural components: 5 (HTML shell, routing engine, content loader, state manager, GIF integration layer)

### Technical Constraints & Dependencies

- **Host:** GitHub Pages — static files only, no server-side execution
- **No build step:** All JS must be vanilla or CDN-loaded; no bundler
- **Brownfield assets:** 9 standalone Three.js HTML files exist as fixed iframes; app does not own their internals
- **CDN dependencies:** marked.js for Markdown rendering; no other external runtime deps at MVP
- **Browser baseline:** WebGL support required (Three.js); modern browsers only

### Cross-Cutting Concerns Identified

1. **Content graph schema** — content.json structure affects routing, authoring, stub detection, and GIF association simultaneously. Schema decisions propagate everywhere.
2. **Client-side state (localStorage)** — section ID and A/B/U history must be read/written consistently across all navigation transitions; corrupt/missing state needs a defined fallback.
3. **GIF iframe integration** — iframes are foreign documents; layout containment, loading performance, and accessibility (text captions) are concerns in every section view.
4. **Responsive layout contract** — mobile-first with 44px touch targets and GIF scaling affects every component with interactive or visual elements.
5. **Stub sentinel** — the "no scaffold below here" state is a condition in the routing graph that must be handled uniformly regardless of how deep the scaffold tree grows.

## Starter Template Evaluation

### Primary Technology Domain

Vanilla static web app. No build step, no bundler, no package manager. GitHub Pages host. This explicitly precludes every framework starter (Next.js, Vite, SvelteKit, Remix, etc.) — they all require a build step or Node runtime.

### Starter Options Considered

| Option | Verdict |
|---|---|
| Vite + vanilla-ts | Requires build step — eliminated |
| Next.js / SvelteKit | Requires Node runtime — eliminated |
| Create React App | Build step + Node — eliminated |
| Manual vanilla scaffold | Only viable option given constraints |

### Selected Approach: Hand-rolled vanilla scaffold

**Rationale:** The PRD constraints ("no build step", "GitHub Pages", "CDN-only") are not preferences — they are hard requirements. Any framework starter would violate them. The application is simple enough (one HTML shell, one JS file, one JSON config, flat content files) that a starter would add complexity rather than remove it.

**Initialization:** Manual — no CLI command. First implementation story is creating the file structure.

**Language & runtime:** Vanilla JavaScript (ES2022). ES modules via `<script type="module">` — native in all target browsers, zero tooling.

**Markdown rendering:** marked.js v18.0.0 via jsDelivr CDN. Pin the major version:
```html
<script src="https://cdn.jsdelivr.net/npm/marked@18/lib/marked.umd.js"></script>
```

**Project structure:**
```
/
├── index.html          # Single HTML shell + script imports
├── app.js              # Routing engine + state manager (ES module)
├── content.json        # Branching config (section graph)
├── sections/           # Markdown content files (one per section)
│   └── s01.md, ...
└── gifs/               # Three.js HTML files (copied from brownfield source)
    ├── A-frontier.html
    ├── A-to-B.html
    ├── U-book-and-person.html
    └── ... (9 total)
```

**Brownfield asset migration:** 9 GIF HTML files at `/Users/alexanderlarge/claude/2026-03-30 - A B U 3D visual/` are copied into `gifs/` as the first implementation step. No modifications to their internals.

**Build tooling:** None. No `package.json`, no `node_modules`.

**Testing:** None at MVP. Manual browser testing only.

**Development experience:** Open `index.html` locally via a static server (e.g. `python3 -m http.server`) — required because ES modules and `fetch()` for Markdown/JSON don't work over `file://`.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block implementation):**
- content.json schema — central data structure; all routing derives from it
- localStorage schema — session persistence contract

**Important (shape architecture):**
- DOM rendering pattern — determines how sections update
- GIF iframe loading strategy — determines WebGL lifecycle
- GitHub Pages deployment config — determines repo root layout

**Deferred (post-MVP):**
- Analytics event schema (PostHog)
- LLM proxy function design (Netlify)
- Payment integration (Gumroad/Stripe)

### Data Architecture

**content.json schema (flat map, nullable fields):**

```json
{
  "start": "s01",
  "sections": {
    "s01": {
      "title": "...",
      "file": "sections/s01.md",
      "gif": "gifs/A-frontier.html",
      "ab": "s02",
      "u": "s01a",
      "stub": false
    }
  }
}
```

- `ab: null` = end of path
- `u: null` = no scaffold below → stub message on U click
- `stub: true` = section is a content-frontier placeholder
- Scaffold sections set `ab` explicitly (not inherited from parent)

**localStorage schema:**

```json
{ "currentSection": "s01", "history": { "s01": "A" } }
```

Stored under key `abu_state`. Missing or malformed state falls back to `content.json`'s `"start"` value.

### Frontend Architecture

**DOM rendering:** `innerHTML` with template literals. Content is author-controlled, no untrusted input, no XSS risk. DOM API would add verbosity with no benefit at this scale.

**GIF iframe loading:** Lazy — iframe created and inserted when section displays; removed on section change. One active WebGL context at a time. Prevents resource waste and visual noise from background renders.

**Routing:** Section ID-based. `app.js` reads `content.json` once on load, holds it in memory. All navigation is a lookup by section ID.

### Infrastructure & Deployment

**GitHub Pages:** Deploy from `main` branch root. No `/docs` subfolder needed — repo contains only web files.

**Local dev:** `python3 -m http.server` (or equivalent). Required because `fetch()` for Markdown/JSON and ES modules don't function over `file://`.

## Implementation Patterns & Consistency Rules

### Critical Conflict Points

5 areas where agents could make incompatible choices without explicit rules.

### Module Structure

`app.js` is the entry point. Logic is split into three ES modules imported by `app.js`:

- `state.js` — all localStorage read/write; exports `getState()`, `setState(patch)`
- `router.js` — loads `content.json`, resolves navigation targets, exports `navigate(sectionId)`
- `renderer.js` — all DOM updates; exports `renderSection(sectionData, markdownHtml)`

No module may directly call `localStorage`. No module may directly manipulate the DOM except `renderer.js`. `router.js` calls `renderer.js`; neither calls the other way.

### Naming Patterns

**Section IDs:** lowercase, no separators for main sections (`s01`, `s02`); suffix `-s` for scaffold sections (`s01-s`). IDs must match across: `content.json` keys, `sections/` filenames (`s01.md`, `s01-s.md`), and `localStorage` history keys.

**JS:** camelCase for functions and variables (`currentSection`, `loadSection`).

**CSS classes:** kebab-case (`section-container`, `abu-buttons`, `stub-message`).

**Files:** lowercase with hyphens where needed (`content.json`, `app.js`, `sections/s01.md`, `gifs/A-frontier.html` — GIF filenames are fixed brownfield assets, do not rename).

### State Patterns

All state reads and writes go through `state.js`. Direct `localStorage.getItem/setItem` calls outside `state.js` are forbidden.

`setState(patch)` merges the patch into current state:

```js
// correct
setState({ currentSection: 's02' });
// forbidden
localStorage.setItem('abu_state', JSON.stringify(...));
```

On load, if `abu_state` is missing or `JSON.parse` throws, silently fall back to `content.json`'s `"start"` value — no error shown to user.

### Rendering Patterns

DOM updates use `innerHTML` with template literals. All section renders go through `renderer.js`'s `renderSection()` — no ad-hoc `innerHTML` assignments elsewhere.

Markdown rendering: `marked.parse(rawMarkdown)` — no custom renderer options at MVP.

### Process Patterns

**Fetch errors:** If `fetch()` for a `.md` file fails, `renderer.js` renders a fallback message in the content area: `"This section could not be loaded."` No console-only failures.

**Async pattern:** `async/await` throughout. No `.then()` chains.

**GIF iframe lifecycle:** On section change, `renderer.js` removes the existing `<iframe>` before inserting the new one. Never leave two iframes in the DOM simultaneously.

### Enforcement

**All agents must:**
- Import only from the three declared modules; no new module files without explicit architectural decision
- Use `state.js` for any localStorage access
- Use `renderer.js` for any DOM update
- Follow the section ID naming scheme exactly — IDs are the join key across four systems (JSON, file system, localStorage, DOM)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
abu-book/
├── index.html              # HTML shell; loads marked CDN, imports app.js
├── app.js                  # Entry point; bootstraps on DOMContentLoaded; event listeners
├── router.js               # Fetches content.json; resolves navigation targets; calls renderer
├── renderer.js             # All DOM updates; section render; stub/error states; iframe lifecycle
├── state.js                # localStorage wrapper; exports getState(), setState(patch)
├── content.json            # Section graph; branching config (source of truth)
├── style.css               # Global styles; mobile-first layout; component classes
├── sections/               # Markdown content files (one per section)
│   ├── s01.md
│   ├── s01-s.md            # Scaffold section for s01
│   ├── s02.md
│   └── ...
├── gifs/                   # Three.js WebGL HTML files (copied from brownfield source)
│   ├── A-frontier.html
│   ├── A-to-B.html
│   ├── U-book-and-person.html
│   ├── U-rejected.html
│   ├── U-to-A.html
│   ├── mal1-maladaptive-b-fires.html
│   ├── mal2-feedback-rejected.html
│   ├── mal3-feedback-integrated-equal.html
│   └── mal4-feedback-integrated-dominant.html
└── .gitignore
```

No `package.json`, `node_modules`, or build configuration.

### Architectural Boundaries

**Application boundary** (`app.js`, `router.js`, `renderer.js`, `state.js`): all routing and rendering logic. Agents implementing reading, navigation, and scaffolding FRs work here.

**Authoring boundary** (`content.json`, `sections/`): author's domain. Agents implementing authoring FRs (FR10–FR15) work here. Agents implementing application logic must not hardcode section IDs — always read from `content.json`.

**Asset boundary** (`gifs/`): fixed brownfield assets. No agent modifies the internals of GIF HTML files. `renderer.js` embeds them as iframes only.

**Presentation boundary** (`index.html`, `style.css`): HTML structure and styles. Aria attributes and Open Graph meta tags live in `index.html`; all visual rules live in `style.css`.

### Data Flow

1. Page load → `app.js` calls `router.js` to fetch `content.json`; calls `state.js` to read `abu_state`
2. `router.js` resolves starting section → fetches `sections/s01.md` → calls `renderer.js`
3. `renderer.js` renders section title, `marked.parse(markdown)`, GIF iframe, A/B/U buttons
4. User clicks A/B → `app.js` calls `state.js` to record response → `router.js` resolves `ab` target → repeat from step 2
5. User clicks U → `router.js` checks `u` field: if section ID, navigate; if null, `renderer.js` shows stub message

### Integration Points

**External:** marked.js v18 via jsDelivr CDN — loaded in `index.html`; available as `window.marked`

**Internal:** GIF files loaded as `<iframe src="gifs/[name].html">` by `renderer.js` on demand

**Deployment:** GitHub Pages serves from `main` branch root; push to `main` = deploy

### Requirements to Structure Mapping

| FR Category | Primary Files |
|---|---|
| Reading & Navigation (FR1–FR6) | `router.js`, `renderer.js`, `state.js` |
| Adaptive Scaffolding (FR7–FR9) | `router.js` (stub/scaffold logic) |
| Content Authoring (FR10–FR15) | `content.json`, `sections/` |
| Accessibility & Platform (FR16–FR18) | `index.html`, `renderer.js` |

## Architecture Validation Results

### Coherence Validation

**Decision compatibility:** All technology choices are mutually compatible. ES modules, marked.js v18 CDN, GitHub Pages static hosting, localStorage, and WebGL iframes have no version conflicts or capability overlaps.

**Pattern consistency:** Naming conventions, module boundaries, and state management patterns are internally consistent and aligned with the vanilla JS stack.

**Structure alignment:** The four-module JS structure (app/router/renderer/state) maps cleanly to the four FR categories. Boundaries are respected by the data flow.

### Requirements Coverage

All 18 FRs and 7 NFRs are architecturally supported with two schema corrections applied during validation (see below).

### Gaps Identified and Resolved

**Gap 1 (moderate) — FR5 back-navigation:**
Original localStorage schema stored a flat history map, which records responses but not navigation order. Back-navigation requires an ordered stack.

Resolution: `visitedStack` array added to localStorage schema.

```json
{
  "currentSection": "s03",
  "history": { "s01": "A", "s02": "B" },
  "visitedStack": ["s01", "s01-s", "s02", "s03"]
}
```

`router.js` pops `visitedStack` on back navigation. `state.js` pushes the current section to `visitedStack` before every `navigate()` call.

**Gap 2 (minor) — FR17 GIF caption missing from content.json schema:**
No field existed for screen reader / WebGL fallback text. Resolution: `gifCaption` optional string field added to section nodes. `renderer.js` renders it as `<p class="gif-caption">` beneath the iframe. `null` for sections without a GIF.

Final content.json section schema:

```json
{
  "title": "What is a belief?",
  "file": "sections/s01.md",
  "gif": "gifs/A-frontier.html",
  "gifCaption": "A network of nodes grows at its frontier, new nodes appearing one by one.",
  "ab": "s02",
  "u": "s01-s",
  "stub": false
}
```

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context analysed; scale and complexity assessed
- [x] Technical constraints identified (GitHub Pages, no build step, brownfield assets)
- [x] Cross-cutting concerns mapped (content graph, state, iframe integration, a11y, stub sentinel)

**Architectural Decisions**
- [x] Technology stack fully specified (vanilla JS ES2022, marked.js v18, GitHub Pages)
- [x] content.json schema defined (including post-validation gifCaption addition)
- [x] localStorage schema defined (including post-validation visitedStack addition)
- [x] DOM rendering, iframe lifecycle, and deployment config decided

**Implementation Patterns**
- [x] Module structure and boundaries defined
- [x] Naming conventions established (section IDs, JS, CSS, files)
- [x] State management rules specified
- [x] Error handling and async patterns documented
- [x] Enforcement rules stated

**Project Structure**
- [x] Complete directory structure defined
- [x] Architectural boundaries specified (application, authoring, asset, presentation)
- [x] Data flow documented end-to-end
- [x] FR categories mapped to files

### Architecture Readiness Assessment

**Overall status:** READY FOR IMPLEMENTATION

**Confidence level:** High

**Key strengths:**
- Constraints are hard and non-negotiable — eliminates entire categories of decision ambiguity
- content.json is a single source of truth; no routing logic is duplicated or implicit
- Module boundaries prevent agent conflicts in the most conflict-prone areas (state, DOM)
- Brownfield asset boundary is explicit — GIF internals are off-limits

**Areas for future enhancement (post-MVP):**
- LLM proxy function design (Netlify serverless)
- PostHog analytics event schema
- Payment integration pattern
- Multi-level scaffold depth (currently one level per section)

### Implementation Handoff

**First implementation step:** Create file scaffold (index.html, app.js, router.js, renderer.js, state.js, content.json, style.css, sections/, gifs/) and copy the 9 GIF HTML files from `/Users/alexanderlarge/claude/2026-03-30 - A B U 3D visual/` into `gifs/`.

**All agents must:** refer to this document for any architectural question. Do not invent new module files, naming conventions, or schema fields without an explicit architectural decision.
