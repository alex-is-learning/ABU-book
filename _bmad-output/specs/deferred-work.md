# Deferred Work

## Story B — Full Content Graph

**Status: done**

**Completed:** 2026-04-14

**What was done:**
- Expanded `content.json` to 6 main sections (s01–s06) + 6 scaffold sections (s01-s–s06-s) with GIF assignments and gifCaptions
- Created `sections/s02.md` through `sections/s06.md` — placeholder markdown
- Created `sections/s02-s.md` through `sections/s06-s.md` — scaffold placeholders
- Fixed double-click race condition: navigation lock (`let navigating = false`) added to `router.js`; all three exported navigation functions (`navigate`, `navigateU`, `back`) acquire the lock before executing
- Fixed `ab: null` history corruption: `app.js` now guards A/B clicks with `!section.ab` before writing history or calling navigate

**Remaining author work:** Replace placeholder prose in `sections/s01.md` through `sections/s06.md` and their scaffold counterparts with actual book content.

---

## Deferred review findings (resolved)

**1. Double-click race condition** — FIXED in `router.js`

**2. Non-stub `ab: null` history corruption** — FIXED in `app.js`
