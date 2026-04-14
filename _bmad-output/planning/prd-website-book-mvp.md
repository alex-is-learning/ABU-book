---
workflowType: 'prd'
workflow: 'edit'
classification:
  domain: general
  projectType: web_app
  complexity: low
  projectContext: brownfield
inputDocuments:
  - '_bmad-output/planning/prd-website-book-full-vision.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-30-2100.md'
stepsCompleted: ['step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
lastEdited: '2026-04-14'
editHistory:
  - date: '2026-04-14'
    changes: 'Stripped full-vision PRD to GitHub Pages MVP. Cut: LLM chat, PostHog, Formspree, password gate, PWYW payment, branching onboarding, waitlist, Netlify. Kept: A/B/U routing mechanic, GIF embeds, localStorage, stub pages, Markdown authoring, mobile-responsive layout.'
---

# Product Requirements Document — A/B/U Interactive Book (MVP)

**Author:** Alex
**Date:** 2026-04-14

## Executive Summary

A short interactive book teaching the A/B/U epistemological framework through a *metacognition-foregrounding medium*. Readers self-assess their epistemic state (A/B/U) at each section; the interface routes them forward on A or B, and descends to simpler scaffolding on U. Authored by Alex — a recent A/B/U learner — exploiting the "curse of knowledge" inversion: a guide two steps ahead is more effective than an expert.

Target readers: (a) total newcomers to epistemology/metacognition; (b) ORI-adjacent people who've heard A/B/U but haven't internalised it.

MVP goal: ship a working, readable site on GitHub Pages that Defender can read and say "this is what I wanted."

### What Makes This Special

1. **The medium is the lesson.** Practising A/B/U self-labelling while reading *about* A/B/U is the pedagogy — not an add-on.
2. **Spatial, animated epistemology.** Nine embedded 3D GIFs (Three.js, already built) make abstract belief mechanics visceral: crystallisation, rejection, and maladaptation are watched, not just described.
3. **Right-distance authorship.** Alex learned A/B/U recently; this is the advantage, not a liability.

### Project Classification

- **Project type:** Web app (static, browser-rendered, GitHub Pages — no build step, no serverless)
- **Domain:** General (educational/publishing; no regulatory compliance)
- **Complexity:** Low (pure static; no backend, no external services)
- **Project context:** Brownfield — 9 standalone HTML GIF files are the core visual assets

## Success Criteria

### User Success

- Reader correctly applies A/B/U labels to their own epistemic states after engaging
- Reader achieves at least one A or B per session (self-reported via button)
- Reader can reach a stub page and understand they are at the content frontier

### Business Success

- **MVP:** Defender reads the draft site and says "this is exactly what I wanted"
- **Post-MVP:** Site is publicly shareable; Defender can signal-boost via Substack link

### Technical Success

- All GIFs embed and play correctly within the reading flow
- A/B/U buttons route correctly: A/B advances, U descends to scaffold or stub
- localStorage persists reader position and A/B/U history across browser sessions
- Site renders correctly on mobile

### Measurable Outcomes

- Defender approval at MVP launch
- Site loads and is fully readable at the GitHub Pages URL without error

## User Journeys

### Journey 1: Maya — Curious Newcomer (Primary User, Success Path)

Maya is 28, works in UX research. She follows Defender on Substack and sees a link. She clicks.

No gate. First section loads. A 3D animation — nodes crystallising, a belief snapping into place. Something clicks. She clicks **A**. The page advances.

Three sections in, she hits something denser. Clicks **U**. Descends to scaffold. It clicks. She clicks **A** and continues up.

She reaches end of available content. Stub page: *"We haven't scaffolded this level yet — content stops here for now."* She understands she's at the frontier.

**Capabilities revealed:** linear reading, A/B/U routing, scaffold descent, stub page, return to main path.

### Journey 2: Tom — ORI-Adjacent Reader (Hits the Frontier)

Tom has been in ORI Discord for a year. Defender drops the link. He reads fast. Lots of Bs. Section 5: maladaptive B dynamics he hadn't considered. Section 7 doesn't exist. Stub: *"We haven't scaffolded this level yet."* Not frustrated — impressed by the honesty.

**Capabilities revealed:** stub pages, clean frontier message.

### Journey 3: Alex — Author Adding Content

Two weeks after launch. Alex decides to write "What is a frontier?" — 200-word explainer. He creates a Markdown file, updates `content.json` to route U clicks from section 4 to the new lemma. Pushes to GitHub. GitHub Pages deploys in under a minute.

**Capabilities revealed:** Markdown authoring, `content.json` branching config, push-to-deploy.

### Journey Requirements Summary

| Capability | Journeys | Phase |
|---|---|---|
| Linear reading path | J1, J2 | MVP |
| A/B/U buttons with routing (advance / descend / stub) | J1, J2 | MVP |
| Graceful stubs at content frontier | J2 | MVP |
| Scaffold descent and return to main path | J1 | MVP |
| localStorage session state | J1 | MVP |
| Markdown authoring + push-to-deploy | J3 | MVP |
| Text feedback form (Formspree) | — | Growth |
| LLM chat scaffold | — | Growth |
| Analytics (PostHog) | — | Growth |
| Pay-what-you-want | — | Growth |
| Email capture / waitlist | — | Growth |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Metacognition-Foregrounding Medium (new category)**
Quantum Country / Orbit (Nielsen & Matuschak, 2019) embedded spaced repetition into a physics textbook. This product goes further: instead of *testing* recall, readers *label their own epistemic state* in real time. The labelling act is the pedagogical intervention — not the content.

**2. Interface-Enforced Value-Based Pricing** *(post-MVP)*
"Pay what you want" is not new. What is new: the *interface detects* what you got. A reader who clicked only U throughout has a materially different path than one who clicked A and B. The payment prompt reflects a lived experience. Reserved for Growth phase.

### Market Context

| Competitor | Gap |
|---|---|
| Quantum Country / Orbit | No adaptive routing, no epistemic state tracking |
| Standard interactive articles | No self-assessment mechanic; content doesn't respond to reader state |

## Architecture Overview

Pure static site hosted on GitHub Pages. No build step. No backend. No external services at MVP.

**Stack:**
- Single HTML shell with JavaScript-driven content switching
- Markdown files (one per section) rendered client-side via `marked.js` (CDN)
- `content.json` maps each section ID to: title, GIF iframe reference, A/B destination, U destination, stub flag
- `localStorage` stores current section ID and A/B/U response history
- Push to GitHub `main` branch → GitHub Pages auto-deploys

**GIF assets:** Existing standalone HTML files embedded via `<iframe>`. Already built; no changes needed.

**Browser support:** Chrome, Firefox, Safari, Edge (last 2 major versions). Three.js WebGL excludes legacy browsers.

**SEO:** Basic `<meta>` and Open Graph tags on the index page so Substack link previews render correctly.

### Responsive Design

- Mobile-first layout
- GIFs scale down with `max-width: 100%` from native 800×600
- Touch targets minimum 44×44px

### Accessibility

- A/B/U buttons: `aria-label` attributes with plain-language descriptions
- GIFs: text caption beneath each (screen reader context)
- Keyboard-accessible navigation

## Project Scoping

### MVP Feature Set

| Capability | Rationale |
|---|---|
| Linear reading path (5–6 Markdown sections with embedded GIFs) | The content is the product |
| A/B/U buttons with routing | Core mechanic — without this it's a static article |
| Scaffold descent on U | One scaffold level per section; add depth post-MVP from usage data |
| Graceful stubs + frontier message | Honest about where content ends |
| localStorage session state | Persists position and A/B/U history across sessions |
| Push-to-deploy via GitHub Pages | Author can publish new content in under a minute |

### Growth Phase (Post-Defender Approval)

- Text feedback form (Formspree) with section context
- PostHog A/B/U event analytics per section
- LLM chat scaffold (requires serverless — Netlify or similar)
- Pay-what-you-want link (Gumroad or Stripe)
- Email capture on stubs ("notify me")
- Multi-level adaptive branching
- Public launch announcement via Defender/Substack

## Functional Requirements

### Reading & Section Navigation

- **FR1:** Reader can view a section's text content and associated GIF animation
- **FR2:** Reader can advance to the next section by registering an A or B response
- **FR3:** Reader can register a U response to indicate a section did not land
- **FR4:** Reader can see their current position within the reading path
- **FR5:** Reader can return to a previously visited section
- **FR6:** The system preserves a reader's position and A/B/U response history across browser sessions via localStorage

### Adaptive Scaffolding

- **FR7:** The system presents a simpler scaffold section when a reader registers U
- **FR8:** Reader is shown a stub message when no scaffold exists below their current level
- **FR9:** Reader can navigate back to the main path from a scaffold section after registering A or B

### Content Authoring

- **FR10:** Author can add a new section by creating a Markdown file and updating `content.json`
- **FR11:** Author can specify branching targets (A/B destination, U destination, stub flag) for each section in `content.json`
- **FR12:** Author can embed a GIF animation in any section via iframe reference in `content.json`
- **FR13:** The system renders Markdown content client-side without a build step
- **FR14:** Author can publish new or updated content by pushing to the GitHub repository
- **FR15:** Author can create a scaffold section and associate it with a parent section via `content.json`

### Accessibility & Platform

- **FR16:** The site functions correctly on modern mobile and desktop browsers (Chrome, Firefox, Safari, Edge — last 2 versions)
- **FR17:** GIF animations include a text description for readers who cannot render WebGL
- **FR18:** A/B/U interactive controls are operable via keyboard

## Non-Functional Requirements

### Performance

- **NFR1:** Each section (Markdown + GIF) loads and is readable within 3 seconds on standard broadband
- **NFR2:** A/B/U button interactions complete without perceptible delay (<200ms)
- **NFR3:** GIF animations do not block or delay display of section text

### Scalability

- **NFR4:** Content architecture supports at least 50 sections and 3 scaffold levels per section without refactoring

### Accessibility

- **NFR5:** All interactive elements meet WCAG 2.1 Level AA for keyboard operability and screen reader compatibility
- **NFR6:** GIF animations comply with WCAG 2.3.1 (no content flashing more than 3 times per second)
- **NFR7:** All text meets WCAG 2.1 AA colour contrast ratio (minimum 4.5:1)
