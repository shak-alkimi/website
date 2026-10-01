# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Source for the **Alkimi** (LED tape-light business) marketing website. The site is built in **Framer**, and this repo is **only** the code-component layer. The visual canvas, pages, CMS content, and most of the site are **not** in the repo and are not editable from here.

**⚠️ There is NO automatic sync between this repo and Framer** (verified 2026-07-08 in a full audit — the "main" chip in the Framer editor is Framer's own internal branching, not git). This repo is a manually-maintained mirror. **Framer's code editor is the source of truth for what actually runs.** After changing a file here, port it into Framer by pasting into the code editor (project: **"Alkimi (Shak)"**, framer.com/projects/Alkimi-Shak--Cf6zWteoRnYaaVh8Afqa-b8JbM) and save with Ctrl+S — or make the change in Framer first and mirror it back here. Keep both sides identical; note the port in the commit message.

**Project topology (2026-09-29):** the working Framer project is **"Alkimi (Shak)"** — framer.com/projects/Alkimi-Shak--Cf6zWteoRnYaaVh8Afqa-b8JbM — publishing to the staging domain fulfilled-development-106906.framer.app. Launch = move www.alkimiworks.com onto this project — a deliberate manual cutover. **Port code into "Alkimi (Shak)", not "Alkimi".**

This supersedes the 2026-07-08 mapping, which named "Alkimi" (framer.com/projects/Alkimi--HZpxiZndjQNb8SpbXGqf-5RVN6 → alkimi.framer.website) as the main project and "Alkimi (copy)" as the holder of www.alkimiworks.com. Both of those projects still exist; which one currently serves www.alkimiworks.com was **not** re-verified on 2026-09-29. Note the repo's five components were documented against "Alkimi" — whether identical copies exist in "Alkimi (Shak)" is also unverified.

Each `.tsx` file at the root is a standalone Framer code component (note the `addPropertyControls(...)` blocks and `@framerSupportedLayoutWidth` doc-comment annotations). They render inside Framer, not in a local dev server.

## Commands

There is no build, test, lint, or dev command. There is no `package.json`. Do not introduce one — these files are consumed by Framer's runtime, which provides:

- Imports from `framer` (`addPropertyControls`, `ControlType`, `RenderTarget`, `withCSS`)
- Imports from `framer-motion`
- URL imports like `https://framer.com/m/framer/default-utils.js@^0.45.0` (Framer-hosted shared utilities — not npm packages)
- React (implicit)

Edits are validated by porting into Framer's code editor and previewing there (see the no-sync warning above).

## The components

- [Copyright_year.tsx](Copyright_year.tsx) — auto-updating year
- [Counter.tsx](Counter.tsx) — number counter that animates when scrolled into view (IntersectionObserver)
- [FormSpark.tsx](FormSpark.tsx) — contact form posting to `api.formspark.io/{formId}`; the largest component, with email-regex validation, loading/success/error states, and many `addPropertyControls`
- [Share_blob.tsx](Share_blob.tsx) — social/share code overrides (X, LinkedIn, Facebook, Email, Clipboard, WhatsApp, Tumblr)
- [Valide/Scroll_Progress.tsx](Valide/Scroll_Progress.tsx) — scroll-progress indicator (subfolder is a Framer "module")

Deleted from the repo 2026-06-12: `Pagination.tsx` (was empty), `FramerButton.tsx` (badge-hider with third-party affiliate code; moot on Pro plan). As of 2026-07-08 both files STILL EXIST in Framer's code panel — delete them there (and any canvas instances) when convenient.

## Conventions to preserve

- Keep the `@framerIntrinsicWidth`, `@framerIntrinsicHeight`, `@framerSupportedLayoutWidth`, `@framerSupportedLayoutHeight` JSDoc annotations — Framer's editor reads them.
- `addPropertyControls(Component, { … })` exposes editable knobs in the Framer canvas. Adding/removing a control changes the editor UX for anyone who has placed this component on a page.
- `RenderTarget.current() === RenderTarget.canvas` checks are intentional — components often render differently inside the Framer editor vs. the published site (see `FormSpark`'s `isCanvas` to show placeholder values in the canvas).
- TypeScript is loose by design here — `any` types in prop interfaces are common because Framer's `ControlType.Object` returns untyped objects. Don't tighten these without a reason.


## Canvas state worth knowing (not in this repo)

These live only in the Framer canvas, but they are expensive to re-derive, so they are recorded here.

### Menu divider line animation

The animated rules between the nav menu rows are instances of the **`Line Animation Global`** component (Assets → Project → Global). It holds paired variants: an idle `Line Mobile Menu N` (child `Line` at Width 0%) and an active `Line Mobile Menu N Active` (Width 100%). The 6th pair is still named **`Variant 16`** (idle) / **`Variant 15`** (active) — Framer's rename control rejects automation, so these need renaming by hand.

**Where the timing lives.** On each *Active* variant's Styles → Transition. Both the draw duration and the stagger are there:

| Row | Variant | Time | Delay |
|---|---|---|---|
| Products | Line Mobile Menu 1 Active | 1.2 | 0.2 |
| Elements | Line Mobile Menu 2 Active | 1.2 | 0.35 |
| Projects | Line Mobile Menu 3 Active | 1.2 | 0.5 |
| About | Line Mobile Menu 4 Active | 1.2 | 0.65 |
| News | Line Mobile Menu 5 Active | 1.2 | 0.8 |
| Contact | Variant 15 | 1.2 | 0.95 |

Easing is `0.65, 0, 0.13, 1` on all six (copied from the Newsroom divider on Home). Full sweep completes ~2.1s; measured live 2026-09-30.

**Two delays used to stack.** Each idle variant also has an Appear interaction (Interactions → Appear → the Active variant) with its own Delay. Those are all set to **0** so the stagger has a single source of truth in the variant Transition. If a line starts late, check both.

**Desktop and mobile share these variants.** `Mobile Full Navigation` has two variants — `Variant 1` (mobile/tablet, via `Navigation Mobile`) and `Desktop Full Menu` (≥1200px). Each has six `Line` wrappers whose `Global / Line Animation Global` child must be assigned **in row order**: Menu 1, 2, 3, 4, 5, then `Variant 16`. Both breakpoints were found scrambled and were fixed 2026-09-30. Because the variants are shared, a timing change applies to both automatically — but the per-instance *assignment* is separate and must be checked on each.

**Don't add competing Appear effects.** Both breakpoints previously had an instance-level Effects → Appear (opacity + offset) on each divider fighting the width draw. All twelve were removed.

### Menu row geometry (why the dividers are even thickness)

Under each variant, `Menu Content -> Link Wrapper` holds **13** children: a top spacer, then six rows and six dividers alternating. Names are ambiguous in the layer tree — the rows are `Individual Link Wrapper`, the dividers are `Line`. They sit at the same depth, so clicking by position is how you set the wrong one.

| Layer | Height | Count per variant |
|---|---|---|
| top spacer (`Individual Link Wrapper`) | 100, Fit content | 1 |
| row (`Individual Link Wrapper`) | **45, Fixed** | 6 |
| divider (`Line`) | **1, Fixed** | 6 |

Verified on both `Variant 1` and `Desktop Full Menu`, 2026-09-30.

**Why 45/1.** Row pitch is `row + line + 2 x gap`. `45 + 1 = 46` is even, and the doubled gap is always even, so the pitch is even whatever the gap is (desktop gap 7 -> pitch 60). At `devicePixelRatio` 1.5 an even pitch puts every 1px divider on the same sub-pixel phase, so they all render the same weight. An odd pitch alternates phase and the dividers look alternately thick and thin — that was the original complaint. Changing the gap can never fix it; the gap is counted twice.

**Setting these reliably.** Filter the layer panel (search `Line` or `Individual`) — the filtered tree is flat and does not reshuffle when you select a row, unlike the expanded tree. Multi-select with Ctrl+click and set Height once. Two traps: a multi-select whose Height *type* reads `Mixed` silently drops a typed value (set them all to `Fixed` first, then type the number), and the Framer canvas is a cross-origin iframe so it cannot be measured from the page — read `[data-is-right-panel]` in the top document instead.

### Newsroom divider (Home) uses a different mechanism

The rule above the Newsroom heading is the same component but driven by an instance-level **Effects → Scroll → Variant** (Trigger `Layer in view`, Replay No, From `Line Animation` → To `Line Animation Active`), with the instance's own Variant set to the Active one. This is deliberate — don't "fix" it to match the menu. Note `Layer in view` exists only on this instance-level effect, not in a variant Interaction's trigger list (which offers only Click / Click start / Appear / Mouse enter / Mouse leave).

### CMS collections, and which one a "Sorting" field resolves against

Collections as of 2026-10-01: **Home** (2), **Fixtures** (11), **Elements** (5), **Projects** (10), **News** (7).

The **Home** collection is not page content — it is the two category cards: `Fixtures` (Sorting Order 1, slug `polestar`) and `Elements` (2, slug `arrival`). Both render as cards that link to the `/products` and `/elements` **pages**, so their slugs appear unused.

**Projects** holds 3 Live and 7 Draft:

| Sorting Order | Item | Status | Slug |
|---|---|---|---|
| 1 | Belmont Park | Live | `positive-energy` |
| 2 | Resorts World | Live | `first-round` |
| 3 | Tuft | Live | `the-leader` |
| 4–10 | Hyundai Motor Group, Glossier, TonicTales, Enigma, Sayso, Glossier Copy, Hyundai Motor Group Copy | Draft | — |

**The trap.** The `Home / Home - Projects Row` component exposes several numeric controls that resolve against *different collections*:

- `Sorting Left` / `Sorting Right` → the **Home** collection (so 1 = Fixtures, 2 = Elements)
- `Sorting Image Wide` → the **Projects** collection

Framer only shows the controls relevant to the active variant, which is why the two-up instances never display `Sorting Image Wide`. Do not "tidy" `Sorting Left`/`Sorting Right` to match Projects numbering — that blanks or swaps the Fixtures/Elements cards.

### Projects grid and list are hardcoded slots, not a collection list

`/projects-grid` and `/projects-list` each contain **10** `Projects / Project Grid - Card` instances per breakpoint. Each has a numeric **`Filter`** property, 1–10, which matches a Projects item by `Sorting Order`. No matching item renders an **empty card**, not a collapsed one. Adding a project means either numbering it into a free slot or adding/removing card instances per breakpoint.

Slot geometry (Desktop): slots 1–3 are a 3-across `Stack`; 4/5 are a `Section - Projects Grid` with wide-left + narrow-right; 6–8 another 3-across `Stack`; 9/10 mirror 4/5 as narrow-left + wide-right.

The **"Case Studies (3)" count is static text**, not a live count. It lives inside the `Projects / Grid - List Toggle` component, is shared across all six of its variants and both pages, and must be edited via Edit component — there is no instance property for it. Update it by hand whenever the Live project count changes.

### Hiding unused slots, and how breakpoints inherit it

With 3 live projects the other 7 slots render as empty cards (grid) or bare divider lines (list). The fix is **Visible: No** on the unused containers, not deleting them — they are wanted back as projects are added.

- `/projects-grid` → `Main`: keep the first `Stack` (slots 1–3); hide the following `Section - Projects Grid`, `Stack`, `Section - Projects Grid` (slots 4–10).
- `/projects-list` → `Main → Section Projects → Container → Projects List`: keep the first three `Projects` + `Line A…` pairs; hide pairs 4–10.

**Visibility set on the primary (Desktop) breakpoint propagates to Tablet and Phone automatically.** Verified on both pages 2026-10-01 — don't redo it per breakpoint, just confirm the greyed rows match.

### The grid/list toggle — why it vanished, and the fix (resolved 2026-10-01)

`Projects / Grid - List Toggle` sits at the **breakpoint root**, a sibling of `Main` between `Navigation Mobile` and `Main` — not inside `Main`. That placement is load-bearing: Framer only offers `Position: Fixed` to direct children of the page frame, so moving it into `Main` greys `Fixed` out and the pill jumps to the top of the page, overlapping the logo.

**Working config on `/projects-grid`:**

| Property | Value |
|---|---|
| Position Type | `Fixed`, pin bottom edge only |
| `B` | Desktop 30, Tablet 45, Phone 30 |
| L / R | 481 / 480 (grid page), 480 / 481 (list page) |
| Z index | 8 |
| Variant | `Grid Active` (grid page) / `List Active` (list page) |
| `Main` Min Height | **`100vh`** |
| `Main` padding-bottom | **`500`** |
| Effects → Scroll → Variant | `Section in view` · Viewport bottom · Replay `Yes` · `#footer` → `Grid Hide` |

**Two separate things were hiding it, and they had to be fixed in order.**

1. **The footer painted over it.** The toggle precedes `Main` and `Footer / Footer` in the layer tree, so the footer comes later in the DOM and — with no z-index on either at the time — covered the `Fixed` pill. Measured at 1440x900: pill at (601, 810) 239x60 with `opacity: 1`, but an opaque `rgb(0,0,0)` 1440x661 footer sat above it in the element stack (pill at index 9, footer at 5). This only happened because hiding slots 4–10 made the page short enough for the footer to reach the pill's fixed position at load. Fixed by `Main` → **Min Height `100vh` plus padding-bottom `100`**, which puts the footer's top at `viewport height + 100` — below the fold at *any* window height, unlike a fixed padding value.

2. **The `Scroll → Variant` effect hid it anyway.** Even with the footer below the fold, the pill never appeared. Removing `Effects → Scroll → Variant` from the toggle fixed it. **Effects cascade from the primary (Desktop) breakpoint** — removing it on Desktop cleared it on Tablet and Phone too.

The effect was removed on 2026-10-01 to prove it was the cause, then restored once the padding gave its trigger room. **Verified working 2026-10-01**: toggle visible on load, hides as the footer comes into view, reappears on scrolling back. The list page has the equivalent with `List Hide`.


**Effects cascade from the primary (Desktop) breakpoint** — adding or removing one on Desktop applies it to Tablet and Phone too.
**Why `500` and not less.** The trigger is `#footer` entering the viewport, and it needs real room to distinguish "at the footer" from "at the top of the page". Measured at 1440x854: the stock template's footer sits **1668px** below the fold (3224px page, 10 projects); ours sat **7px** below it (1522px page, 3 projects) — which is why the effect fired instantly. `Main`'s content is ~760px, so the footer lands at `760 + padding`; 500 puts it ~400px below the fold on an ~854px-tall window.


`min-height: 100vh` stays, but note it *caps* the benefit on very tall windows: it forces the footer to at least the fold, so above roughly a 1260px-tall viewport the gap closes again and the toggle may hide at load. The real fix then is more content, not more padding.

**This will right itself as projects are added.** Once the grid is naturally tall, the padding can come back down.
### Project detail template ("More projects" row)

`/projects` → `Projects` in the Pages panel is the CMS **detail-page template** (one generated page per item at `/projects/{slug}`), not a separate page. `/news` → `News` is the same for articles.

Its bottom row is a `Home - Projects Row` whose cards bind to the item's `Sorting Next Project 1` / `2` fields — which, per the trap above, resolve against the **Home** collection. So it always shows Fixtures + Elements and never other case studies, and **any value of 3 or more renders a blank card**. All three live projects are set to 1 and 2 so the row is full; the heading was renamed from "More projects" to **"Lighting options"** (2026-10-01) to match what it actually links to.

### GlobalScrollbarHider puts a 1px line at the top of every page

`GlobalScrollbarHider` is a code component (1×1px, opacity 0, pointer none). Framer gives code-component wrappers a 1px minimum size, so when its Position is `Relative` it sits in normal flow and pushes `<main>` down by 1px — the page wrapper's background then shows as a hairline across the top. It is only *visible* where that background contrasts with what is below it (white page over a dark hero).

**Fix: set Position → `Absolute`.** Three instances per page, one per breakpoint. Done on every page 2026-10-01; verified live with `main` at top 0 on all 11 URLs. If a new page is added, check this.

### Stale Ora template names

Layer and field names across this template rarely match their content, so searching the layer tree by visible text usually fails:

- The project page's "Lighting options" heading is a text layer named **`News`**.
- Inside `Grid - List Toggle`, "Case Studies" is **`About us`** and the "(3)" is **`Always looking…`**.
- `Sorting Next Project 1/2` do not point at the next project (see above).
- Several Projects items were renamed but kept their old slugs.

### Framer automation gotchas (CMS table and property panel)

- **CMS table cells: `Ctrl+A` does not select inside the cell** — it silently does nothing and typed text *appends* to the existing value (this is how a `3` became `22`). Use double-click → `End` → several `BackSpace` → type.
- `Enter` commits a cell and moves the selection **down one row**, so each cell needs a fresh double-click.
- The row **context menu** (`Add to agent / Undraft / Duplicate / Delete`) opens on right-click but dismisses before a scripted follow-up click lands. Duplicating items has to be done by hand.
- **Duplicated CMS items inherit the original's `Sorting Order`**, so they collide until renumbered.
- Native `<select>` controls (e.g. Position Type) reject click automation: focus the element via JS, then press `Home` for the first option (`Absolute`) or arrow keys.
- Clicking a page in the Pages panel immediately after switching tabs is often swallowed — verify the page actually changed before editing.
- **A page reload wipes the undo history** — `Edit → Undo` greys out. Before removing anything you might need back, record it.
- Arrow-key navigation of a `<select>` **skips disabled options**, which looks like the value jumping two at a time. `End` lands on the last option; step back up from there.
- After a `<select>` change commits the element **loses focus** — re-focus it via JS before each subsequent key press, or only the first key registers.
- Reading `select.value` from JS right after a change returns the **stale** value. Screenshot the panel to confirm what actually took.
- The Pin widget sets edges **exclusively**: clicking an edge line clears the others.
- Selecting a container in the layer tree **auto-expands** it, shifting every row below. Filter the tree via the search box for a flat, stable list.
- Property-panel popovers (e.g. Scroll variant) **reposition** when the window resizes — re-screenshot before clicking into one.
- `Ctrl+A` on the canvas opens a **"Delete selection — for all project collaborators"** dialog. Cancel it.
- **CRITICAL — Framer's effects do not run in a hidden/unfocused tab.** Any tab driven by automation reports `document.visibilityState === "hidden"` and `document.hasFocus() === false`, and in that state Framer runs **neither appear animations nor scroll/variant effects**. Consequences, both of which wasted hours on 2026-10-01:
  - Appear-animation containers stay stuck at `opacity: 0.001`, so page content (e.g. the project cards) never paints and screenshots look blank. The **stock Ora template shows the same stuck state**, which is how to confirm it is the environment and not the site.
  - An element hidden by a scroll effect reads `opacity: 1`, because the effect that would hide it never ran. **Reading `opacity` to decide "is it visible?" is meaningless here** and will produce confident, wrong conclusions.
  Geometry (`getBoundingClientRect`) and paint order (`elementsFromPoint`) are still valid, since they don't depend on the effects engine. Anything animation- or effect-dependent must be confirmed by a human in a real, foregrounded window.
- **`elementsFromPoint` checks must count images, not just background colours.** Filtering for `backgroundColor !== 'transparent'` silently ignores `<img>` elements and will report "nothing is covering it" when a photo is.
- **Padding per side fields are ordered `t, r, b, l`** — the fourth box is LEFT, not bottom. Natural-language element locators reliably mislabel the fourth as "bottom"; confirm by reading each input's adjacent label letter before typing.
- **Padding cascades down breakpoints**: a value set on Desktop appears on Tablet and Phone, and setting Tablet then cascades to Phone. Set Desktop first, then override Tablet, then Phone, and re-check all three afterwards — earlier values get overwritten.
- Framer's canvas can freeze screenshot capture (`Page.captureScreenshot` times out) while JavaScript still runs. Drive the panel by focusing elements via JS and sending real key events instead of clicking coordinates.
- **DANGER — never send keys without confirming a field is focused.** With a layer selected and focus on the canvas/layer tree, `BackSpace` **deletes the layer** and arrow keys **move/reorder** it. A helper that focuses a panel input must be checked for success before any key is sent; if it reports "not found", stop. Both failure modes were hit on 2026-10-01: arrow keys reordered `Main` after `Footer` (footer rendered above the content on all three breakpoints) and BackSpace deleted `Main` outright. Both were recovered with Ctrl+Z.
- **Ctrl+Z goes to whatever has focus.** With the cursor in the layer-search box it undoes the search text, not the canvas action. Clear focus by clicking empty canvas first, then undo.
- **A canvas undo can roll back more than the last action** — undoing the layer reorder also reverted per-breakpoint padding overrides on Tablet and Phone back to the inherited Desktop value.
- The **Min Max → Add…** menu (Min/Max Width/Height) does not accept scripted clicks, and keyboard navigation hits the layer-tree danger above. Add Min Height by hand.
- The properties panel is **virtualised** — inputs scrolled out of view are absent from the DOM, so a read can show only some fields. Scroll the relevant section into view before reading or trusting values.
- The screenshot coordinate frame may be the CSS frame scaled by `devicePixelRatio`; verify against a known element before clicking by coordinate.

## Dispatch board (cross-surface coordination)

The shared board is **GitHub issue #1** in the **private repo `shak-alkimi/dispatch`** — the single coordination channel between desktop agent sessions (this repo, the configurator repo) and Shak's Claude mobile app. It stays open permanently. Body sections: Now / Next / Blocked / Needs-Shak's-call / Decisions-log; the comment thread is the running log (mobile drops decisions there).

- **Session start:** `gh issue view 1 --repo shak-alkimi/dispatch --json body` for state, AND `--comments` for decisions Shak left from mobile.
- **Session end (or after shipping something):** update the body — overwrite the state sections, APPEND to Decisions-log, bump the "Last updated" footer.
- **Clobber guard (mandatory):** body updates are last-writer-wins — ALWAYS re-read the body immediately before overwriting and carry forward anything another session added. Never write from a stale copy.
- **Content hygiene:** even though the repo is private, never post credentials/tokens/secret URLs, customer data, vulnerability details, patent-sensitive configurator logic, pricing formulas, or SOS/QBO account specifics.
- Board is coordination only — it is not a source of truth for site content (that lives in Framer) or app data (SOS / QBO / Base44).
- Codex (auditor) reads the board for awareness but never writes it — board upkeep is implementer (Claude Code) work.

## Other notes

- A standing audit of this repo (issues F1–F22, severity-grouped) lives at `C:\Users\shaki\alkimi-issues.md` — snapshot dated 2026-05-11. Most findings are minor. Verify before acting on a specific issue ID since code may have shifted.
- Sister repo: the internal quoting tool at `C:\Users\shaki\alkimi-code` (Base44 / Vite / React). Shared branding only — the codebases are independent.

## Known-open items in Framer (not repo work)

As of 2026-10-01, carried over between sessions:

- `Variant 15` / `Variant 16` in `Line Animation Global` still need renaming to "Line Mobile Menu 6 Active" / "Line Mobile Menu 6".
- Home page "First Round" project card has `Source: External` — should be `Projects`, which is why replacing its CMS thumbnail had no effect.
- `Navigation Desktop` root carries a `Click → Tap 2` interaction, so the whole bar acts as the menu button and swallows the logo's home link. The `×` on an Interactions row rejects automation.
- `/projects-list` reports collection-filter errors; the Projects menu item links there.
- `FramerButton (delete this)` still sits on `/projects-grid` and `/projects-list`. `Pagination.tsx` and `FramerButton.tsx` were deleted from this repo 2026-06-12 but still exist in Framer's code panel.
- The three Live projects still publish under Ora template slugs: Belmont Park at `/projects/positive-energy`, Resorts World at `/projects/first-round`, Tuft at `/projects/the-leader`. Pre-launch is the cheap moment to rename them; re-check the Home and nav links afterwards.
- Seven Draft projects occupy `Sorting Order` 4–10, two of them duplicates (`Glossier Copy`, `Hyundai Motor Group Copy`) created 2026-10-01 purely to fill grid slots 9/10 in the canvas. They are invisible on the published site. If any go Live, the static "(3)" count label needs updating by hand.
