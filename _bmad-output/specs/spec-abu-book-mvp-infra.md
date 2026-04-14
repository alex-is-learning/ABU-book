---
title: 'A/B/U Book — MVP Routing Engine + Shell'
type: 'feature'
created: '2026-04-14'
status: 'done'
baseline_commit: 'dde0e78df136a351aaf7ff5f157a837736db641d'
context:
  - '_bmad-output/planning/architecture.md'
  - '_bmad-output/planning/prd-website-book-mvp.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The A/B/U interactive book has a complete architecture and PRD but no implementation.

**Approach:** Build the routing engine and site shell: four JS modules (app/router/renderer/state), HTML, CSS, GIF copy, and a minimal 3-section content.json (one main section, one scaffold, one stub) that exercises every routing path end-to-end.

## Boundaries & Constraints

**Always:**
- No build step, no package.json — vanilla JS ES2022 modules, CDN-only dependencies
- GitHub Pages deploy from `main` root; all web files at repo root
- All localStorage through `state.js` only (`getState` / `setState(patch)`)
- All DOM mutation through `renderer.js` only (`renderSection`)
- Section IDs: `s01` for main; `s01-s` for scaffold; `s02` as terminal stub — join key across content.json, `sections/` filenames, localStorage
- State key `abu_state`; schema: `{ currentSection, history: {id: "A"|"B"|"U"}, visitedStack: [] }`
- Corrupt/missing `abu_state` falls back silently to `content.json`'s `"start"` value
- marked.js v18 via jsDelivr: `https://cdn.jsdelivr.net/npm/marked@18/lib/marked.umd.js`

**Ask First:**
- Any new module file beyond app.js, router.js, renderer.js, state.js
- Any content.json schema field additions

**Never:**
- Modify internals of any GIF HTML file
- Hardcode section IDs in JS — always derive from content.json
- Use `.then()` chains — `async/await` throughout
- Leave two `<iframe>` elements in the DOM simultaneously

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit | No `abu_state` | Loads `"start"` section from content.json | N/A |
| A or B click | Section with valid `ab` target | Records response in history, navigates to `ab` | N/A |
| U click — scaffold exists | Section with `u` set to scaffold ID | Navigates to scaffold section | N/A |
| U click — no scaffold | Section with `u: null` | Stub message in-place; currentSection unchanged | N/A |
| Stub section | `stub: true` | Renders: *"We haven't scaffolded this level yet — content stops here for now."* | N/A |
| Back click | `visitedStack` non-empty | Pops stack, renders previous section; no history mutation | N/A |
| Markdown fetch failure | Network error on `.md` file | Renders "This section could not be loaded." in content area | In-page message |
| A/B on scaffold | Scaffold section, A/B clicked | Navigates to scaffold's explicit `ab` target | N/A |

</frozen-after-approval>

## Code Map

- `index.html` — HTML shell; marked CDN; `<script type="module" src="app.js">`; OG meta; aria landmark structure; A/B/U + Back buttons
- `app.js` — DOMContentLoaded bootstrap; event delegation on `#nav-controls`; imports router + state
- `router.js` — fetches content.json once on load; `navigate(sectionId)`; `back()`; resolves stub/scaffold conditions; calls renderer
- `renderer.js` — `renderSection(section, html)`; `showStub()`; `showError()`; iframe lifecycle (remove old before inserting new)
- `state.js` — `getState()` (parse, return null on error); `setState(patch)` (spread-merge then write)
- `content.json` — 3-section test graph; source of truth for all routing
- `style.css` — mobile-first; 44px touch targets; GIF `max-width:100%`; WCAG AA contrast
- `sections/s01.md` — main section placeholder
- `sections/s01-s.md` — scaffold section placeholder
- `sections/s02.md` — stub section placeholder
- `gifs/*.html` — 9 files copied verbatim from `/Users/alexanderlarge/claude/2026-03-30 - A B U 3D visual/`
- `.gitignore` — `.DS_Store`, `.idea/`, `.vscode/`

## Tasks & Acceptance

**Execution:**
- [x] `gifs/` — copy A-frontier.html, A-to-B.html, U-book-and-person.html, U-rejected.html, U-to-A.html, mal1-maladaptive-b-fires.html, mal2-feedback-rejected.html, mal3-feedback-integrated-equal.html, mal4-feedback-integrated-dominant.html verbatim from `/Users/alexanderlarge/claude/2026-03-30 - A B U 3D visual/`
- [x] `state.js` — `getState()` parses `abu_state`, returns null on missing/error; `setState(patch)` spreads patch into current state and writes JSON
- [x] `content.json` — `"start": "s01"`; s01: title "What is A?", file sections/s01.md, gif gifs/A-frontier.html, gifCaption "Nodes growing at the frontier of a belief network.", ab "s02", u "s01-s", stub false; s01-s: title "A — Simpler", file sections/s01-s.md, gif null, gifCaption null, ab "s02", u null, stub false; s02: title "Content frontier", file sections/s02.md, gif null, gifCaption null, ab null, u null, stub true
- [x] `router.js` — on init: fetch and cache content.json; `navigate(id)`: fetch section's `.md`, call `setState({currentSection: id, visitedStack: [...stack, prev]})`, call `renderer.renderSection(section, marked.parse(md))`; if `u: null` on U click, call `renderer.showStub()` instead; `back()`: pop visitedStack, navigate
- [x] `renderer.js` — `renderSection(section, html)`: replace `#content-area` innerHTML with title H2, optional `<p class="gif-caption">`, optional `<iframe class="gif-frame" src="...">`, content div; remove previous iframe before inserting; disable Back button when visitedStack empty; `showStub()`: render stub message; `showError(msg)`: render error message
- [x] `app.js` — DOMContentLoaded: import router + state; call router init then `navigate(getState()?.currentSection ?? start)`; delegate clicks on `#nav-controls`: A/B → `setState({history: {..., [current]: btn}})` then `router.navigate(ab)`; U → `router.navigateU()`; Back → `router.back()`
- [x] `index.html` — charset, viewport meta, OG meta (title "A/B/U Interactive Book", description stub, image stub), marked CDN script, stylesheet link, `<main id="content-area">`, `<nav id="nav-controls">` with buttons id="btn-a" aria-label="I understood this (A)", id="btn-b" aria-label="I already knew this (B)", id="btn-u" aria-label="This didn't land for me (U)", id="btn-back" aria-label="Go back"; `<script type="module" src="app.js">`
- [x] `style.css` — body: font-family system-ui, max-width 720px, margin auto, padding 1rem; `#nav-controls`: display flex, gap 0.5rem, margin-top 1.5rem; `.abu-btn`: min-width/height 44px, padding 0.5rem 1rem, border-radius 4px, distinct background colours for A (green tones), B (blue tones), U (amber tones), Back (neutral); `.gif-frame`: display block, width 100%, max-width 800px, aspect-ratio 4/3, border none; `.stub-message`, `.error-message`: font-style italic, color #666; media ≤480px: flex-wrap wrap on nav buttons; all colour combos ≥4.5:1 contrast ratio
- [x] `sections/s01.md` — `# What is A?\n\nPlaceholder — main content for section s01 goes here.`
- [x] `sections/s01-s.md` — `# What is A? — Simpler\n\nPlaceholder — scaffold content for s01 goes here.`
- [x] `sections/s02.md` — `# Content Frontier\n\nWe haven't written this section yet.`
- [x] `.gitignore` — `.DS_Store`, `.idea/`, `.vscode/`

**Acceptance Criteria:**
- Given no prior state, when the page loads, then section s01 renders with title, GIF iframe, and parsed markdown
- Given s01 is displayed, when A or B is clicked, then s02 loads and `abu_state.history.s01` equals "A" or "B"
- Given s01 is displayed, when U is clicked, then s01-s loads
- Given s01-s is displayed, when A or B is clicked, then s02 loads
- Given s01-s is displayed, when U is clicked, then a stub message renders in-place and currentSection stays "s01-s"
- Given s02 (stub) is displayed, all A/B/U buttons behave as if stub — stub message shows
- Given any navigation has occurred, when Back is clicked, then the previous section renders and visitedStack shrinks by one
- Given `python3 -m http.server` at repo root, when loading in Chrome/Firefox/Safari, then zero console errors and all GIF iframes render
- Given a 375px viewport, when any section loads, then GIFs scale within viewport and buttons meet 44px touch target

## Verification

**Manual checks:**
- `python3 -m http.server 8080` from repo root → `http://localhost:8080`
- Click A → s02 (stub) loads; click U from s01 → s01-s loads; click A from s01-s → s02 loads
- DevTools → Application → Local Storage → `abu_state` updates on each navigation
- Back steps through visit history correctly
- Resize to 375px — layout holds, buttons ≥44px
- Tab key reaches all four nav buttons

## Suggested Review Order

**Navigation state contract**

- localStorage schema and merge semantics; try/catch wraps setItem for private-browsing safety
  [`state.js:16`](../../state.js#L16)

- Section graph; single source of truth for all routing; read once on init, never mutated
  [`content.json:2`](../../content.json#L2)

**Routing engine**

- `navigate()` — pushes prev section to visitedStack before updating currentSection; stub render + banner
  [`router.js:17`](../../router.js#L17)

- `navigateU()` — checks `section.u`; null → showStub in-place; non-null → navigate
  [`router.js:76`](../../router.js#L76)

- `back()` — pre-nulls currentSection to prevent double-push; restores full state on navigate throw
  [`router.js:91`](../../router.js#L91)

- `boot()` — init sequence with error recovery; restores saved section from localStorage
  [`app.js:5`](../../app.js#L5)

- Click delegation — single listener on `#nav-controls`; null-guards content before init resolves
  [`app.js:25`](../../app.js#L25)

**DOM rendering**

- `renderSection()` — iframe inserted via slot trick to prevent browser reset; one iframe at a time
  [`renderer.js:12`](../../renderer.js#L12)

- `showStub()` — idempotent; appends banner without replacing section content
  [`renderer.js:45`](../../renderer.js#L45)

- Nav landmarks, aria-labels, Back button initially disabled
  [`index.html:23`](../../index.html#L23)

**Presentation**

- `.abu-btn` touch targets (44px min); WCAG AA colours with contrast ratios annotated
  [`style.css:83`](../../style.css#L83)

- Mobile breakpoint; buttons wrap to 2×2 grid at ≤480px
  [`style.css:143`](../../style.css#L143)

**Peripherals**

- Three placeholder sections exercise the full routing path end-to-end
  [`sections/s01.md:1`](../../sections/s01.md#L1)
