# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Source for the **Alkimi** (LED tape-light business) marketing website. The site is built in **Framer**, and this repo is **only** the code-component layer. The visual canvas, pages, CMS content, and most of the site are **not** in the repo and are not editable from here.

**⚠️ There is still NO automatic sync between this repo and Framer.** Nothing in Framer pushes to git and nothing in git pushes to Framer; the "main" chip in the Framer editor is Framer's own internal branching, not git (verified 2026-07-08). This repo is a **manually-maintained mirror**, and Framer remains the source of truth for what actually runs.

**What changed 2026-10-05 is the workflow, not that fact.** Pasting by hand into Framer's code editor is no longer the only route: an authorized **Framer Agent CLI** session can read and write code files directly (`framer.getCodeFiles()`, `codeFile.setFileContent()`), which makes drift *detectable* and reconciliation scriptable. The mirror still has to be kept in step deliberately — the CLI only removes the copy-paste step. See the Framer Agent CLI section.

**Project topology — verified 2026-10-05 from the Framer dashboard:**

| Project | ID | Plan | Serves |
|---|---|---|---|
| **Alkimi (teaser)** | `jIeEHcbQNHV85rO12kAf` | Pro | **www.alkimiworks.com** — the live coming-soon page carrying the working Formspark form |
| **Alkimi (main)** | `lGFTo9egwT6d6ra5S4uP` | ~~Pro~~ — subscription moved away 2026-10-05 | to be archived; do not invest in it |
| **Alkimi (Shak)** | `Cf6zWteoRnYaaVh8Afqa` | **Pro** (moved from `Alkimi (main)` 2026-10-05) | fulfilled-development-106906.framer.app — the staging/work project **this repo mirrors** |
| Ora (official) | `idoYUmcTUjWl1zFENTWM` | Free | the stock template, kept for comparison |

`Alkimi (teaser)` → `www.alkimiworks.com` is **confirmed, not inferred**: that project's `getPublishInfo()` returns the domain, and its live `FormSpark` instance carries formId `75jmfofPI` — the same endpoint the production form POSTs to.

**`Alkimi (Shak)` is on Pro as of 2026-10-05** — the subscription was moved across from `Alkimi (main)`, which is now the one on its way out. `Alkimi (main)` is to be archived; **do not invest in it**.

**The plan cannot be read through the Agent API.** `getProjectInfo()` returns only `{ id, name, apiVersion1Id }` — no plan, no entitlements. The observable test is the **"Made in Framer" badge in the published HTML**: `grep __framer-badge-container` on the served page. `www.alkimiworks.com` (Pro) returns **0** occurrences; a Free project returns 2.

**The badge is baked in at PUBLISH time, so a plan upgrade does not clear it retroactively.** Immediately after the Pro transfer, staging still served the badge because its last deploy (and therefore its HTML) predated the change. **It clears on the next publish, not before** — so "I upgraded but the badge is still there" is expected, not a failed upgrade. Do not go looking for a layer to delete, and do not reintroduce a badge-hider component (that is what `FramerButton.tsx` was, and it carried third-party affiliate code).

What remains of the launch sequence: `www.alkimiworks.com` cut over from `Alkimi (teaser)` onto `Alkimi (Shak)`, and the teaser's working Formspark form migrated onto the contact page — at which point the staging form's empty `formId` gets filled and the fixed `FormSpark.tsx` becomes the live one.

**The old mapping is stale — ignore it.** Earlier notes named the projects "Alkimi" (`HZpxiZndjQNb8SpbXGqf`) and "Alkimi (copy)"; neither name nor ID exists in the dashboard now. Launch remains a deliberate manual cutover of www.alkimiworks.com onto the launch project.

**This repo mirrors `Alkimi (Shak)` only.** `Alkimi (teaser)` is a separate project with its own code files. **Do not put teaser files in this repo root** — the two sets would blur with nothing to tell them apart. If the teaser's code ever needs mirroring, give it an explicit directory of its own and record the decision here first.

Each `.tsx` file at the root is a standalone Framer code component (note the `addPropertyControls(...)` blocks and `@framerSupportedLayoutWidth` doc-comment annotations). They render inside Framer, not in a local dev server.

## Commands

There is no build, test, lint, or dev command. There is no `package.json`. Do not introduce one — these files are consumed by Framer's runtime, which provides:

- Imports from `framer` (`addPropertyControls`, `ControlType`, `RenderTarget`, `withCSS`)
- Imports from `framer-motion`
- URL imports like `https://framer.com/m/framer/default-utils.js@^0.45.0` (Framer-hosted shared utilities — not npm packages)
- React (implicit)

Edits are validated by porting into Framer's code editor and previewing there (see the no-sync warning above).

## Framer Agent CLI (added 2026-10-05)

`npx @framer/agent@latest` — Framer's own CLI (package `@framer/agent`, published by Framer staff). It reaches a project through the Server API and can read and write code files, inspect the canvas, query and edit the CMS, and publish. It is a `0.0.x` **beta**; treat its surface as liable to change.

```bash
npx @framer/agent@latest setup                     # installs skills into ~/.claude/skills (once per machine)
npx @framer/agent@latest project auth "<url|id>"   # browser approval — no API key passes through the agent
npx @framer/agent@latest session new "<id>"        # prints a session id; reuse it for every call
npx @framer/agent@latest exec -s <id> -f script.js # run JS against the project
npx @framer/agent@latest docs [Class[.method]]     # the full API reference, offline
```

**Authorized projects (2026-10-05):** `Alkimi (Shak)` `Cf6zWteoRnYaaVh8Afqa` and `Alkimi (teaser)` `jIeEHcbQNHV85rO12kAf`. Each project is authorized separately.

**Detecting drift** — the thing the old "paste it in and note it in the commit message" convention was standing in for, which silently failed for four months:

```js
const files = await framer.getCodeFiles()
return files.map(f => ({ path: f.path, content: f.content ?? "" }))
```

Dump that, diff against the repo, and **normalise line endings first** — Framer serves `\n`, the repo is `\r\n`, so every file reads as changed otherwise.

**Writing:** `codeFile.setFileContent(code)` creates a new version in Framer, so there is a rollback path there as well as in `framer-snapshot/`. Always read the file back in a *separate* call and compare — do not trust the write call's own response.

**Gotchas worth knowing before you start:**

- **Sessions expire** when the relay restarts, failing with "Session is invalid or has expired". It fails cleanly, but verify after each write rather than batching a long sequence.
- `exec` returns a bare string for string returns, **not** JSON — do not `JSON.parse` it.
- Top-level `return` inside an `exec` script works; top-level `return` in a browser-side `javascript_tool` eval does not.
- **Component instances** are found by `componentIdentifier`, which is `local-module:codeFile/<id>:default` — the `local-module:` prefix is required, and without it everything tallies as zero. An identifier starting `module:` instead means a *remote* package, not your local file.
- **Code overrides cannot be located through the node API** at all — no `codeOverrides` attribute exists. To tell whether an override is live, scan the published page's JS bundles for a distinctive string from it, and validate the method against a component you know is live.
- `getVersions()` is blocked by this permission scope ("missing read access to module owner"), so Framer-side edit timestamps are not available.
- **Telemetry is on by default**: `npx @framer/agent@latest telemetry disable`.

## Production contact form — fixed 2026-10-05

The live form on **www.alkimiworks.com** (project `Alkimi (teaser)`, formId `75jmfofPI`) was **reporting success on failed submissions**. The pre-audit `FormSpark.tsx` did this:

```js
.then(() => { setSuccess(true); onSubmit() })   // no response.ok check
```

Any response — including 400/500 — replaced the form with the success tick, so a visitor whose enquiry failed was told it had been sent. Live in that state from **12 June until 5 October 2026**; the project had not been republished since 8 July.

**Fixed** by pushing the repo's `FormSpark.tsx` (which checks `response.ok`, renders a `role="alert"` error, and guards `onSubmit?.()`) into `Alkimi (teaser)` and publishing. Only that one file was changed in that project; its other six code files are still pre-audit.

**Verified live, both paths:**

| | Failure path | Success path |
|---|---|---|
| Formspark response | forced 500 (blocked in-browser, never sent) | real 200 |
| Form | **stays**, message preserved | removed |
| `role="alert"` | 1 | 0 |
| Shown | *"Something went wrong — please try again."* | success tick |

**How to re-test without creating an enquiry** — monkeypatch `fetch` in the browser so the Formspark request never leaves it:

```js
const real = window.fetch.bind(window)
window.fetch = async (i, init) => {
  const url = typeof i === "string" ? i : i?.url ?? ""
  if (/formspark/i.test(url)) return new Response("{}", { status: 500 })
  return real(i, init)
}
```

Then fill and submit. A correct build keeps the form and shows the alert; a broken one removes the form and shows the tick. Reloading the page clears the patch.

**Note:** `Alkimi (Shak)`'s own `FormSpark` instances have an **empty `formId`**, so the staging contact page is not wired to Formspark at all. It is a placeholder until the teaser's form is migrated across at launch — at which point it inherits the fixed component.

## The components

The repo mirrors **12** of the 14 code files in `Alkimi (Shak)`. Instance counts are from the canvas, read 2026-10-05; **0 means nothing on the canvas renders it**, so changing it has no visible effect.

| File | Kind | Instances | |
|---|---|---|---|
| [GlobalScrollbarHider.tsx](GlobalScrollbarHider.tsx) | component | **34** | 1x1px, opacity 0; see the GlobalScrollbarHider note below |
| [VideoThumbnail.tsx](VideoThumbnail.tsx) | component | **6** | |
| [ProductsFilterPills.tsx](ProductsFilterPills.tsx) | component | **6** | products filter row |
| [FormSpark.tsx](FormSpark.tsx) | component | **3** | contact form; `formId` is **empty** on staging — see the production-form section |
| [Counter.tsx](Counter.tsx) | component | 0 | IntersectionObserver number counter |
| [ElementsFilter.tsx](ElementsFilter.tsx) | component | 0 | |
| [Valide/Scroll_Progress.tsx](Valide/Scroll_Progress.tsx) | component | 0 | **the canvas uses a remote module, not this file** — `module:tZ4BBLxqep75fqWPDP07/…/Scroll_Progress.js`. Editing this copy changes nothing. |
| [Copyright_year.tsx](Copyright_year.tsx) | override | — | **unused**: no copyright line exists anywhere on the site |
| [Share_blob.tsx](Share_blob.tsx) | override | — | share overrides (X, LinkedIn, Facebook, Email, Clipboard). A `Share Article` block exists on news pages but **none of its URLs appear in the published bundles**, so the overrides are not attached |
| [ProductElementsLink.tsx](ProductElementsLink.tsx) | override | — | sets `sessionStorage["products-filter"]` |
| [ProductsFilterAutoSelect.tsx](ProductsFilterAutoSelect.tsx) | override | — | reads it on /products and clicks the pill |
| [ElementCounts.tsx](ElementCounts.tsx) | override | — | six count overrides (Optic, Driver, LED, Profile, Flex, Connector) |

Override usage **cannot be read through the node API** — see the Agent CLI gotchas for the bundle-scanning method used above.

**Deleted from Framer 2026-10-05:** `Pagination.tsx` (0 bytes, no exports) and `FramerButton.tsx` (badge-hider carrying third-party affiliate code). Both were deleted from the repo 2026-06-12 and had lingered in Framer's code panel ever since. Verified unused first — `getNodesWithAttributeSet("componentIdentifier")` returned **0 instances** of `FramerButton` in `Alkimi (Shak)` *and* in `Alkimi (teaser)` — then removed with `codeFile.remove()`, taking Framer from 14 code files to 12. The repo and Framer are now a **1:1 mirror, 12/12**, verified byte-identical the same day. `FramerButton.tsx`'s content survives verbatim in `framer-snapshot/` if it is ever wanted back. **Both files still exist in `Alkimi (teaser)`** (same 1,543 bytes, also 0 instances) — left alone because that project is still pre-audit.

**Removed 2026-10-05:** `ProductFilterFromURL.tsx` and `ProductFilterLinks.tsx` — a URL-query-parameter approach to deep-linking the products filter (`/products?filter=elements`). They existed **only in the repo**, never in Framer, despite commit `7d053fc` saying "ported into Framer manually". They were superseded by the sessionStorage pair that is actually in Framer — `ProductElementsLink` + `ProductsFilterAutoSelect`. `ProductFilterFromURL.tsx` is recoverable from `7d053fc`; `ProductFilterLinks.tsx` was never committed and is gone. Revisit only if the query-parameter approach is deliberately revived.

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
