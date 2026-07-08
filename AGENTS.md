# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Source for the **Alkimi** (LED tape-light business) marketing website. The site is built in **Framer**, and this repo is **only** the code-component layer. The visual canvas, pages, CMS content, and most of the site are **not** in the repo and are not editable from here.

**⚠️ There is NO automatic sync between this repo and Framer** (verified 2026-06-12 in a full audit — the "main" chip in the Framer editor is Framer's own internal branching, not git). This repo is a manually-maintained mirror. **Framer's code editor is the source of truth for what actually runs.** After changing a file here, port it into Framer by pasting into the code editor (project: "Alkimi", framer.com/projects/Alkimi--HZpxiZndjQNb8SpbXGqf-5RVN6) and save with Ctrl+S — or make the change in Framer first and mirror it back here. Keep both sides identical; note the port in the commit message.

**Project topology (2026-06-12):** the "Alkimi" Framer project publishes to alkimi.framer.website (preview). The separate "Alkimi (copy)" project owns the production domain www.alkimiworks.com and serves a coming-soon page. Launch = move the domain to the main project and publish — a deliberate manual cutover.

Each `.tsx` file at the root is a standalone Framer code component (note the `addPropertyControls(...)` blocks and `@framerSupportedLayoutWidth` doc-comment annotations). They render inside Framer, not in a local dev server.

## Commands

There is no build, test, lint, or dev command. There is no `package.json`. Do not introduce one — these files are consumed by Framer's runtime, which provides:

- Imports from `framer` (`addPropertyControls`, `ControlType`, `RenderTarget`, `withCSS`)
- Imports from `framer-motion`
- URL imports like `https://framer.com/m/framer/default-utils.js@^0.45.0` (Framer-hosted shared utilities — not npm packages)
- React (implicit)

Edits are validated by pushing to the branch Framer is watching and previewing in the Framer editor.

## The components

- [Copyright_year.tsx](Copyright_year.tsx) — auto-updating year
- [Counter.tsx](Counter.tsx) — number counter that animates when scrolled into view (IntersectionObserver)
- [FormSpark.tsx](FormSpark.tsx) — contact form posting to `api.formspark.io/{formId}`; the largest component, with email-regex validation, loading/success/error states, and many `addPropertyControls`
- [Share_blob.tsx](Share_blob.tsx) — social/share code overrides (X, LinkedIn, Facebook, Email, Clipboard, WhatsApp, Tumblr)
- [Valide/Scroll_Progress.tsx](Valide/Scroll_Progress.tsx) — scroll-progress indicator (subfolder is a Framer "module")

Deleted 2026-06-12 (remove any canvas instances in Framer if they still exist): `Pagination.tsx` (was empty), `FramerButton.tsx` (badge-hider with third-party affiliate code; moot on Pro plan).

## Conventions to preserve

- Keep the `@framerIntrinsicWidth`, `@framerIntrinsicHeight`, `@framerSupportedLayoutWidth`, `@framerSupportedLayoutHeight` JSDoc annotations — Framer's editor reads them.
- `addPropertyControls(Component, { … })` exposes editable knobs in the Framer canvas. Adding/removing a control changes the editor UX for anyone who has placed this component on a page.
- `RenderTarget.current() === RenderTarget.canvas` checks are intentional — components often render differently inside the Framer editor vs. the published site (see `FormSpark`'s `isCanvas` to show placeholder values in the canvas).
- TypeScript is loose by design here — `any` types in prop interfaces are common because Framer's `ControlType.Object` returns untyped objects. Don't tighten these without a reason.

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
