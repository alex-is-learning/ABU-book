# Deferred Work

## Story B — Full Content Graph

**Deferred from:** spec-abu-book-mvp-infra.md (Story A)
**Dependency:** Story A must be merged first (content.json schema is established there)

**Scope:**
- Expand `content.json` from 3-section test graph to 6 main sections (s01–s06) + 6 scaffold sections (s01-s–s06-s) + proper GIF assignments and gifCaptions
- Create `sections/s01.md` through `sections/s06.md` — placeholder markdown (H1 + one paragraph per section describing intended content)
- Create `sections/s01-s.md` through `sections/s06-s.md` — scaffold placeholders

**Note:** The actual book prose (replacing placeholders) is author work — not an agent task.

---

## Deferred review findings (from spec-abu-book-mvp-infra review)

**1. Double-click race condition**
Concurrent `navigate()` calls (rapid button presses) can interleave `visitedStack` writes and produce duplicate or stale entries. Fix: add an in-flight navigation lock (`let navigating = false`) that drops clicks while a navigation is in progress.

**2. Non-stub `ab: null` history corruption**
If a non-stub section has `ab: null` and user clicks A/B, `app.js` writes the history label before calling `navigate(null)`, which errors. The label is written for a section that was never advanced from. Fix when expanding content.json in Story B: ensure all non-stub sections with `ab: null` are also marked `stub: true` (or add an explicit end-of-path section), OR guard `navigate(section.ab)` with a null check in `app.js`.
