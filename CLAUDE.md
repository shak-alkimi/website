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

### Newsroom divider (Home) uses a different mechanism

The rule above the Newsroom heading is the same component but driven by an instance-level **Effects → Scroll → Variant** (Trigger `Layer in view`, Replay No, From `Line Animation` → To `Line Animation Active`), with the instance's own Variant set to the Active one. This is deliberate — don't "fix" it to match the menu. Note `Layer in view` exists only on this instance-level effect, not in a variant Interaction's trigger list (which offers only Click / Click start / Appear / Mouse enter / Mouse leave).

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

As of 2026-09-30, carried over between sessions:

- `Variant 15` / `Variant 16` in `Line Animation Global` still need renaming to "Line Mobile Menu 6 Active" / "Line Mobile Menu 6".
- Home page "First Round" project card has `Source: External` — should be `Projects`, which is why replacing its CMS thumbnail had no effect.
- `Navigation Desktop` root carries a `Click → Tap 2` interaction, so the whole bar acts as the menu button and swallows the logo's home link. The `×` on an Interactions row rejects automation.
- `/projects-list` reports collection-filter errors; the Projects menu item links there.
- `FramerButton (delete this)` still sits on `/projects-grid` and `/projects-list`. `Pagination.tsx` and `FramerButton.tsx` were deleted from this repo 2026-06-12 but still exist in Framer's code panel.
