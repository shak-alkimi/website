# Scope — Home projects card section rebuild (phone)

**Written 2026-10-06. Not started. Nothing in this document has been applied.**

## The goal

Get **both** of the things that are currently mutually exclusive on phone:

1. **No white strip** under the hero (the peek the `101vh` hero still leaves on iOS Safari)
2. **The white buffer** that frames the Fixtures / Elements cards

## Why they currently conflict

The white around the cards and the white in the peek are **the same background** — `Section Projects` (`background-color:#fff`). One element is doing two jobs that need opposite colours.

Confirmed by reading the published build and the canvas:

| Fact | Evidence |
|---|---|
| `Section Projects` is the white | `.framer-4dlfzu{background-color:#fff}`; `html body` is black and the hero's background is dark, so nothing else white can reach the eye |
| Its **only child** is the row component instance | canvas read — no wrapper to colour independently |
| The row component **does not paint a background** | its published rule is `…gap:16px;padding:0 15px 15px…` with **no `background`** at all |
| …even though the canvas says it should | variant `Home Projects - Mobile` reads `bg: rgb(255,255,255)`. **The canvas value is not emitted.** Cause unknown — this is the first thing to investigate |
| The mobile variant has **no top padding** | `padding: 0px 15px 15px 15px` (t r b l) — so even if it did paint, there would be no buffer *above* the cards |

Setting `Section Projects` dark removes the peek and takes the card buffer with it. That was tried on 2026-10-06 and reverted.

## Blast radius

The component `Home / Home - Projects Row` (`z64WCa5DN`) is used on:

- `/` — Desktop, Tablet, Phone
- `/projects/:slug` — Desktop, Tablet, Phone (the "Lighting options" row)

**Any change to the `Home Projects - Mobile` variant hits the project detail pages too.** A change made on the Home *page* does not.

## Options

### Option 1 — Make the component paint its own background (cheapest, uncertain)

Give the row component the white instead of the section, then darken the section.

1. Work out **why the variant's white is not emitted** and make it emit (one experiment: set it explicitly via `setAttributes` and re-read the published CSS after a publish).
2. Add **top padding** to `Home Projects - Mobile` (currently `0`) so there is a buffer above the cards.
3. Set `Section Projects` → `#080200` on Phone.

- **Effort:** small *if* step 1 works — three attribute writes and a publish.
- **Risk:** step 1 may be impossible; Framer may be deliberately dropping that background. **Also changes `/projects/:slug` on phone**, which must be checked.
- **Do this first regardless** — it is a cheap probe and it answers the one real unknown.

### Option 2 — Insert a white wrapper inside the section (most robust) — RECOMMENDED

Add a frame inside `Section Projects` holding the row: white background, padding on all four sides. Then `Section Projects` goes dark and only the wrapper is white.

- **Effort:** ~30 minutes of hand work, plus a publish.
- **Must be done BY HAND in the Framer editor.** The Agent API **cannot create nodes on a published page** — `parentId` is silently ignored and the node lands on whatever page is active (see the canvas-editing limits in `CLAUDE.md`). `/` is published.
- **Risk:** low and contained. Scope it to the **Phone breakpoint only** and `/projects/:slug` is untouched.
- Decide whether the wrapper is Phone-only or all three breakpoints — Phone-only is the smaller change and the only one with a problem to solve.

### Option 3 — Gradient on `Section Projects` (hackiest)

One background: dark from 0% to ~N%, white below, so the peek is dark and the cards still sit on white.

- **Effort:** one attribute.
- **Risk:** high. The stop is **proportional to section height**, which is content-driven and changes with CMS content, so the dark band's size is not stable. Setting a `LinearGradient` through the API is also **unproven** and may fail silently the way `ImageAsset` literals did — verify in a separate `exec`, never trust the write.
- Only worth it if Options 1 and 2 are both rejected.

## Verification

1. Fresh-read every write in a **separate `exec`** — writes in this project have silently failed more than once.
2. Publish, then check **Home on phone in both Safari and Chrome**. Phone layout **cannot be verified from the agent environment** — Chrome viewport emulation does not work here (the page keeps reporting `1536 x 855`), so this needs a handset each time.
3. Check **Desktop and Tablet are unchanged** on Home.
4. If Option 1: check **`/projects/:slug` on phone**, which shares the variant.

## Worth weighing before starting

The entire payoff is removing a **~60-80px strip of white under the hero, on iOS Safari only**. Chrome on phone is already correct. Some of the remaining strip is Safari's own toolbar chrome, which **no page change can reach** (see the settled trade-off note in `CLAUDE.md`) — so this work may reduce the strip without eliminating it.

Against that, still open and more consequential: `/careers` advertises **fabricated job openings** and `/contact` lists **four fictitious staff** with `@ora.com` addresses, both live and linked from every footer, plus the template `<title>` and share image on every page.
