# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Source for the **Alkimi** (LED tape-light business) marketing website. The site is built in **Framer**, and this repo is **only** the code-component layer — synced via Framer's GitHub integration. The visual canvas, pages, CMS content, and most of the site are **not** in the repo and are not editable from here.

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
- [FormSpark.tsx](FormSpark.tsx) — contact form posting to `api.formspark.io/{formId}`; the largest component, with email-regex validation, loading/success states, and many `addPropertyControls`
- [FramerButton.tsx](FramerButton.tsx) — hides the Framer badge via injected CSS and rewrites its referral link
- [Pagination.tsx](Pagination.tsx) — empty file (placeholder; do not assume content)
- [Share_blob.tsx](Share_blob.tsx) — social/share widget
- [Valide/Scroll_Progress.tsx](Valide/Scroll_Progress.tsx) — scroll-progress indicator (subfolder is a Framer "module")

## Conventions to preserve

- Keep the `@framerIntrinsicWidth`, `@framerIntrinsicHeight`, `@framerSupportedLayoutWidth`, `@framerSupportedLayoutHeight` JSDoc annotations — Framer's editor reads them.
- `addPropertyControls(Component, { … })` exposes editable knobs in the Framer canvas. Adding/removing a control changes the editor UX for anyone who has placed this component on a page.
- `RenderTarget.current() === RenderTarget.canvas` checks are intentional — components often render differently inside the Framer editor vs. the published site (see `FormSpark`'s `isCanvas` to show placeholder values in the canvas).
- TypeScript is loose by design here — `any` types in prop interfaces are common because Framer's `ControlType.Object` returns untyped objects. Don't tighten these without a reason.

## Other notes

- A standing audit of this repo (issues F1–F22, severity-grouped) lives at `C:\Users\shaki\alkimi-issues.md` — snapshot dated 2026-05-11. Most findings are minor. Verify before acting on a specific issue ID since code may have shifted.
- Sister repo: the internal quoting tool at `C:\Users\shaki\alkimi-code` (Base44 / Vite / React). Shared branding only — the codebases are independent.
