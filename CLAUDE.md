# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Source for the **Alkimi** (LED tape-light business) marketing website. The site is built in **Framer**, and this repo is **only** the code-component layer. The visual canvas, pages, CMS content, and most of the site are **not** in the repo and are not editable from here.

**⚠️ There is still NO automatic sync between this repo and Framer.** Nothing in Framer pushes to git and nothing in git pushes to Framer; the "main" chip in the Framer editor is Framer's own internal branching, not git (verified 2026-07-08). This repo is a **manually-maintained mirror**, and Framer remains the source of truth for what actually runs.

**What changed 2026-10-05 is the workflow, not that fact.** Pasting by hand into Framer's code editor is no longer the only route: an authorized **Framer Agent CLI** session can read and write code files directly (`framer.getCodeFiles()`, `codeFile.setFileContent()`), which makes drift *detectable* and reconciliation scriptable. The mirror still has to be kept in step deliberately — the CLI only removes the copy-paste step. See the Framer Agent CLI section.

**Project topology — verified 2026-10-05 from the Framer dashboard:**

| Project | ID | Plan | Serves |
|---|---|---|---|
| **Alkimi (teaser)** | `jIeEHcbQNHV85rO12kAf` | Pro | **www.alkimiworks.com** — the live coming-soon page carrying the working Formspark form |
| **Alkimi (main)** | `lGFTo9egwT6d6ra5S4uP` | Pro | not verified |
| **Alkimi (Shak)** | `Cf6zWteoRnYaaVh8Afqa` | **Free** | fulfilled-development-106906.framer.app — the staging/work project **this repo mirrors** |
| Ora (official) | `idoYUmcTUjWl1zFENTWM` | Free | the stock template, kept for comparison |

`Alkimi (teaser)` → `www.alkimiworks.com` is **confirmed, not inferred**: that project's `getPublishInfo()` returns the domain, and its live `FormSpark` instance carries formId `75jmfofPI` — the same endpoint the production form POSTs to.

**`Alkimi (Shak)` is on the Free plan.** That is why staging shows the "Made in Framer" badge (`#__framer-badge-container`, injected by the platform) and why the editor shows "Upgrade now". It is a plan artifact, **not** a canvas layer — it cannot be deleted by editing, and it will not follow the site onto a Pro project. Do not spend time hunting for a layer to remove.

**Planned (stated 2026-10-05, not yet done): `Alkimi (main)` will be archived and its Pro status transferred to `Alkimi (Shak)`.** Two consequences worth holding on to:

- **The "Made in Framer" badge is temporary and self-resolving.** It is there only because `Alkimi (Shak)` is currently Free. It will disappear when Pro moves across — so do not spend effort removing it, and do not reintroduce a badge-hider component for it (that is what `FramerButton.tsx` was, and it carried third-party affiliate code).
- **Do not invest in `Alkimi (main)`.** It is on the way out. Launch is: Pro transferred onto `Alkimi (Shak)`, `www.alkimiworks.com` cut over from `Alkimi (teaser)`, and the teaser's working Formspark form migrated onto the contact page — at which point the staging form's empty `formId` gets filled and the fixed `FormSpark.tsx` becomes the live one.

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


**Canvas editing through the API — the limits that actually bite (learned the hard way 2026-10-05):**

- **`parentId` is honoured on DRAFT pages only.** `framer.createTextNode(attrs, parentId)` / `createFrameNode(attrs, parentId)` place the node correctly on a draft page. On a **published page, or anywhere inside a `ComponentNode`, the `parentId` is silently ignored** and the node is dumped at the root of whatever page is *active* in the editor (here `/`, the Home page) — while the call still returns a node and reports success. Proven side by side: `/terms` (draft) landed in `Container`; `/contact`, `/about` and `/careers` (published) all landed on Home. **Always re-read `(await framer.getParent(n.id))?.id` and compare against what you asked for.** This is why the footer links and the contact-form privacy note could not be done from the CLI.
- **Passing `inlineTextStyle` when you create a text node permanently blocks `setText`.** The node is created, `setText` returns without error, and the text is **never** stored — it reads back as `""` in a later session. The working order is **create bare → `setText` → `setAttributes({ inlineTextStyle, … })`**. Eighteen section headings and bodies were built empty before this was found.
- **`setHTML` and `getHTML` are blocked** in this permission scope (`Invalid method: INTERNAL_setHTMLForNode`). There is no rich-text path, so a multi-paragraph document has to be one text node per paragraph.
- **`node.clone()` always lands the copy at the canvas root** and there is no reparenting API — no `setParent`, no `moveNode`, and `cloneNode()` takes no parent. Clones *do* accept `setText`, unlike freshly created styled nodes, but you cannot get them where you want them.
- **`navigateTo()` is blocked in API mode** (`Method: navigateTo, is not allowed while in mode: api`), so you cannot make a page active to work around the rule above.
- **`getParent()` returns `null` for component-internal nodes, not just for canvas-root nodes.** Do **not** treat "parent is null" as "orphan I created" — a cleanup heuristic built on that matched 18 real `Stack` layers inside components. They survived only because component-internal nodes are immutable here; on a draft page the same heuristic would have deleted real content. Identify your own nodes by a distinctive `name` prefix instead.
- **Reads inside the same `exec` as a write are stale.** A `setText` verified immediately reports the new value, and a `removeNodes` immediately re-lists the removed nodes. Both resolve correctly when re-read in a **separate** `exec`. Never conclude success or failure without a fresh call — this produced one false "MISMATCH" panic and one false "cleanup failed".
- **`removeNodes` sometimes needs a second pass.** First call appears to do nothing (stale read), second call reports zero remaining.
- **`WebPageNode.clone({ path })` is documented as creating a draft but returns `draft: false`.** Set `draft: true` explicitly and verify, or the half-built page ships on the next publish.
- **The `H1` text style is white** (`rgb(255,255,255)`, built for a dark hero). Applied unmodified on a white `Main` it is invisible. Spread it and override `color`. Likewise `Article Title` is **Inter**, not General Sans — the semantic `h2` style `dQyDA_Lpr` is the General Sans one.

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

## Canvas state worth knowing (not in this repo)

These live only in the Framer canvas, but they are expensive to re-derive, so they are recorded here.

### Menu divider line animation

The animated rules between the nav menu rows are instances of the **`Line Animation Global`** component (Assets → Project → Global). It holds paired variants: an idle `Line Mobile Menu N` (child `Line` at Width 0%) and an active `Line Mobile Menu N Active` (Width 100%). The 6th pair was called `Variant 16` / `Variant 15` until 2026-10-02 and is now **`Line Mobile Menu 6`** (idle) / **`Line Mobile Menu 6 Active`** (active). Note this pair sits **active-first** in the layer tree, unlike pairs 1-5.

**Where the timing lives.** On each *Active* variant's Styles → Transition. Both the draw duration and the stagger are there:

| Row | Variant | Time | Delay |
|---|---|---|---|
| Products | Line Mobile Menu 1 Active | 1.2 | 0.2 |
| Elements | Line Mobile Menu 2 Active | 1.2 | 0.35 |
| Projects | Line Mobile Menu 3 Active | 1.2 | 0.5 |
| About | Line Mobile Menu 4 Active | 1.2 | 0.65 |
| News | Line Mobile Menu 5 Active | 1.2 | 0.8 |
| Contact | Line Mobile Menu 6 Active | 1.2 | 0.95 |

Easing is `0.65, 0, 0.13, 1` on all six (copied from the Newsroom divider on Home). Full sweep completes ~2.1s; measured live 2026-09-30.

**Two delays used to stack.** Each idle variant also has an Appear interaction (Interactions → Appear → the Active variant) with its own Delay. Those are all set to **0** so the stagger has a single source of truth in the variant Transition. If a line starts late, check both.

**Desktop and mobile share these variants.** `Mobile Full Navigation` has two variants — `Variant 1` (mobile/tablet, via `Navigation Mobile`) and `Desktop Full Menu` (≥1200px). Each has six `Line` wrappers whose `Global / Line Animation Global` child must be assigned **in row order**: Menu 1, 2, 3, 4, 5, then `Line Mobile Menu 6`. Both breakpoints were found scrambled and were fixed 2026-09-30. Because the variants are shared, a timing change applies to both automatically — but the per-instance *assignment* is separate and must be checked on each.

**Don't add competing Appear effects.** Both breakpoints previously had an instance-level Effects → Appear (opacity + offset) on each divider fighting the width draw. All twelve were removed.

**The full variant inventory is 16, and they are all the same thickness** (counted 2026-10-02): `Line Animation` (Primary), `Line Animation Active`, `Line animate on appear`, `Line Active`, then `Line Mobile Menu 1…5` with their five `… Active` partners, then `Line Mobile Menu 6 Active` and `Line Mobile Menu 6`. Every one of the 16 frames measures **787 x 1**. The only differences between them are the child `Line`'s Width (0% idle -> 100% active) and the Transition timing.

**So "make the desktop dividers thinner by switching to an existing variant" is not available** — there is no thinner variant, and because desktop and mobile share these variants (above) editing one would change both breakpoints anyway. 1px is the floor, and at `devicePixelRatio` 1.5 it rounds up to 2 device pixels, which is why they can read heavy. The only per-breakpoint lever is **contrast**: lower the opacity or lighten the fill on the six `Line` wrappers inside `Mobile Full Navigation -> Desktop Full Menu`, which is an instance-level override and leaves mobile/tablet alone. **Never chase thinness by changing the row pitch or gap** — see the geometry section; an odd pitch brings back the alternating thick/thin rendering. Asked and declined 2026-10-02; left as is.

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

**The Home Newsroom is limited per breakpoint.** `Section News` (a sibling of `Main`, not inside it) holds `Container -> Collection Wrapper -> News`, a Collection List on the **News** collection with a `Limit to`. Desktop and Tablet are **3**; **Phone is 1**, set 2026-10-02 as a breakpoint override (blue label) so the phone page shows only the most recent article. Use that limit rather than hiding individual cards — hidden cards still exist as layers, whereas a lower limit simply never renders them. `Section News` is `Height: Fit content`, so the section shrinks with the content and the footer follows; the gap above the footer comes from the section's own padding and is unaffected by the limit.

**Why the canvas used to show "No items match the current filters" (fixed 2026-10-02).** `Home Project Right` is a Collection List on the **Home** collection, filtered `Sorting Order Equals <Sorting Right>`. With no instance to supply a value, the canvas falls back to the **variable's default**, and that default was **3** — Home only goes up to 2, so zero rows matched and every variant rendered the blue empty-state placeholder on the right card. `Sorting Left`'s default is `1`, which is why only the right side was affected. Changed the default to **2** (Elements); the canvas now renders Fixtures | Elements. Published and the live row was re-measured unchanged (Fixtures/Elements, both cards 761.63) — page instances set the value explicitly, so the default never reached the published site.

Stock does not show this because its row sources from **Projects**, which has items at `Sorting Order 3`. Ours was re-pointed at **Home** and the default was never brought down with it — the same mismatch as the trap above, seen from the canvas side.

Defaults live in **Filters -> the `Sorting Order` pill -> Edit variables**, listing `Sorting Left`, `Sorting Right`, `Link`, `Video URL`, `Sorting Image Wide`. Setting one is safe to verify: the Default text field and its slider move together, which is how you know the change committed rather than just painting the input.

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

### Home projects row — Fixtures/Elements card height mismatch (resolved 2026-10-01)

The two-up cards on Home are `Home / Home - Projects Row`. The right (Elements) card rendered ~3px taller than the left (Fixtures), and later showed an unshaded band along its bottom. Two independent defects; both fixed and verified live.

**Card height comes from a stored `aspect-ratio` on the `Image` layer, not from a height value.** Framer emits `aspect-ratio` so a fixed canvas height scales with the responsive width. Everything above it (`Image Wrapper`, `Product Card`, `Project Left` / `Home Project Right`) inherits the computed height. Rendered height = `imageWidth / ar`.

**The two sides sit on different canvas scales.** The left `Image`'s width basis is `693` (= 1.2 x 577.5); the right's is `239.03`. So *matching the height between the two cards can never work* — only matching the ratio does:

| layer | left | right |
|---|---|---|
| `Image` | 120% / **590** | 120% / **203.504** |
| `Image` published ar | `1.17458` | `1.17458` |
| `Image Wrapper` | Fill / Fit content | Fill / Fit content |
| `Overlay` | 100% / 100% Rel | 100% / 100% Rel |

`203.504 = 239.03 / 1.17458`. If the basis ever shifts, recompute empirically: publish once, read the emitted ar, then `newHeight = ar_published * height_published / 1.17458`. That relationship held to five decimals across three publishes.

**Changing the ratio requires unlock -> set height -> RE-LOCK.** The aspect lock stores the ratio; while it is engaged the height field is cosmetic and edits publish nothing. Unlocking *deletes* the `aspect-ratio` declaration, so the height becomes a literal px value and the card collapses — shipped by accident twice on 2026-10-01. Re-locking writes the ratio from the current width/height. Verify all three steps individually; the height entry in particular fails silently (see gotchas).

**The `Overlay` is a separate layer and was the second defect.** It is the gradient shading the lower part of the card. The right one was `590 Fixed` inside a 762px box, leaving the bottom third unshaded so the card read as ending early. Both sides must be `100% Rel`. Probe with `elementsFromPoint` at the card's lower edge — `Overlay` is in the paint stack on a correct card and absent on a broken one.

**Not load-bearing:** the `Video` / `Component` containers beside the `Image` also carry a ratio (right `1.17`, left `1.17458`) but are `position: absolute` and cannot affect card height. Still mismatched as of 2026-10-01; may show on hover.

**Verifying any of this requires a scroll sweep across both variants, not a single measurement** — see the variant-mounting note under automation gotchas. Confirmed good: images and overlays all 761.63 at scroll 0/700/840 (`Before Scroll State - Below Hero`) and 950/1100/1600 (`Home Projects - Initial State`).

### Home projects row — hover behaviour (2026-10-02)

Hovering a card switches the row to `Home Projects Left Open` / `Home Projects - Right Open`: the hovered column goes `1fr -> 1.5fr`, the other stays `1fr`. Measured at 1536 wide, the cards go 745.5 -> 894.6 / 596.4.

**The image is meant to stay perfectly still; only the card moves.** The image is sized to exactly the fully-expanded card width, from both directions:

```
rest   120% x 745.5 = 894.6
hover  100% x 894.6 = 894.6     (hovered card)
hover  150% x 596.4 = 894.6     (other card)
```

So the card is a mask sliding over a stationary picture. **Do not "fix" those 100% / 150% overrides to match the base 120%** — that breaks the identity and the image grows ~20% on hover. This was tried on 2026-10-02 and reverted.

**The wrappers must be anchored to the card's OUTER edge, not centred.** This was the real defect:

| `Image Wrapper` | correct (= stock) | was |
|---|---|---|
| Left | Distribute **Start** (`justify-content: flex-start`) | Center |
| Right | Distribute **End** (`justify-content: flex-end`) | Center |

Centred, the 894.6px image overhangs a 745.5px card by 74.6px *each side*; as the card grows to 894.6 that offset collapses to zero and the image slides 74.6px. Anchored to the outer edge there is nothing to collapse. Fixed on the base variant 2026-10-02, so it applies to every state. Verified: image `dx = 0, dw = 0` on both cards in both hover variants.

**Other hover facts, all confirmed identical to stock** — don't "fix" these:

- `Product Card` (left) gets `place-content:flex-start; align-items:flex-start` in Left Open only. There is no equivalent on the right card.
- The right card's `Video` container carries `right:-1px` in both hover variants; the left's `Component` has no such bleed.
- In `Before Scroll State - Below Hero` both cards' Mouse enter is **`Reset…`** (no target variant). Hovering in that scroll state does not open a card — it resets the component to its base variant. That is template behaviour.
- Variant Transition is **Spring, stiffness 500 / damping 60 / mass 1** on both hover variants. `zeta = 60 / (2*sqrt(500)) = 1.34`, i.e. **overdamped — it does not overshoot.** Don't reach for "the spring overshoots" as an explanation.

**The hovered card used to end ~4px short of its neighbour (resolved 2026-10-02).** Symptom: resting state perfect, but hovering either card made *that* card 757.8 against the other's 761.6. Cause: the three hover-variant `Image`/`Video` layers that override Width to `100%` also carried a stale `aspect-ratio` override of `1.18045`/`1.18058` instead of the base `1.17458`. `894.59 / 1.18058 = 757.76`; `894.59 / 1.17458 = 761.63`.

**The two hover images sit on DIFFERENT width bases — 200 (left) and 201 (right)** — so the same ratio needs different numbers:

| layer | basis | correct Height |
|---|---|---|
| `Home Projects Left Open` -> `Image Wrapper Left` -> `Image` | 200 | **170.2741703** |
| `Home Projects - Right Open` -> `Image Wrapper Right` -> `Image` | 201 | **171.1255411** |

Both are `100%` Rel on Width. Do not assume the two sides share a basis — assuming that is how `171.1255411` got "reverted" to `170.2741703` on the right card and caused this bug in the first place. Derive the basis empirically from the published rule: `basis = currentHeight x publishedAr`, then `target = basis / 1.17458`.

**How to apply it** (Reset override is NOT reachable by automation — see gotchas): select the layer, **open the aspect lock**, type the target Height, **re-lock**. Confirm the lock state by zoomed screenshot before and after; the padlock glyph is purple/closed when engaged, grey/open when not.

**Verified live 2026-10-02** by class-swapping each variant onto the component root and measuring `Product Card`: resting 761.63/761.63, hover-left 761.64/761.63, hover-right 761.63/761.64. Overlays track the image in every state. The published rules to look for:

```
.framer-v-1rizoid .framer-15m2r2a { aspect-ratio: 1.17458 / 1; width: 100%; }
.framer-v-3q8m7a  .framer-u1j3y9  { aspect-ratio: 1.17458 / 1; width: 100%; }
```

**Still at `1.18045`:** `.framer-v-1rizoid .framer-q1bc20-container` — the left hover `Video`. Its stored height is `590.0000000895` implying a third basis (~696) that could not be pinned down cleanly, and it is `position: absolute` so it cannot affect card height. Left alone deliberately rather than guessed at.

**Separately unresolved:** a reported sub-pixel artifact where the cards look momentarily narrow on their inner edge *while the hover settles*. That is about the transition, not the end state — the end state now measures correct. Every reachable parameter matches stock (interactions, flex, anchoring, alignment overrides, aspect ratios, row padding, transition and spring constants). Two attempts to fix it from static analysis each made something worse and were reverted. **Don't attack this from CSS reading — it needs a side-by-side screen recording against the stock template.**

**The right card's photo used to vanish on hover (resolved 2026-10-02).** Symptom: hover the Elements card and its photo ghosted out to near-nothing, leaving a diagonal striped pattern. Right card only, hover only, resting state fine. Cause: a single variant override —

```
Home Projects - Right Open -> Home Project Right -> Product Card
  -> Image Wrapper Right -> Image     Styles -> Opacity = 0.11
```

The left card's equivalent is `1`, which is why it was one-sided. Set it to `1` and the symptom is gone (confirmed by the user 2026-10-02).

**The diagonal stripes are Framer's placeholder tile, and they are always there.** A classless `<div>` sits at **child index 0 of both `Image Wrapper Left` and `Image Wrapper Right`**, carrying an inline-SVG background (`126x126` diagonal bars, `repeat`, `background-size: 64px auto`). The `Image` above it has `z-index: 1`, so the tile is normally invisible. **Seeing those stripes anywhere means the image above them went transparent — it is never a geometry or missing-asset problem.** Go straight to that layer's `Opacity` in the variant you are in.

**The hover `Video` on both cards is bound to a CMS field that does not exist.** The `Video` component's **Source -> URL** points at **`Thumbnail Video URL - Wide`**, and the **Home** collection has no such field (its fields are Status, Slug, Sorting Order, Sorting Next Project 1, Sorting Next Project 2, 5 Images on List View, Thumbnail Image - Wide, Title). Framer reports this as a purple **`Missing`** pill on the layer's `Visible` row. The right card's `Video` was set **Visible: No** on 2026-10-02 because there is no video content behind the binding; the left card's is untouched and still broken. If hover video is ever wanted, add the field to the Home collection and rebind rather than hiding the layer.

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
- The menu row labels are text layers named **`PROFILE`**, with the row number beside them in **`01`**. Path: `Mobile Full Navigation -> <variant> -> Menu Content -> Link Wrapper -> Individual Link Wrapper -> Open Navigation Link -> PROFILE`. Searching the layer tree for a label like "Products" returns **"No layers found"**. The text content is **shared between `Variant 1` and `Desktop Full Menu`**, so editing it once changes mobile, tablet and desktop together — unlike the per-instance line assignments above. Row 1 was relabelled Products -> **Fixtures** on 2026-10-02; the page slug is still `/products` and the link still points there.

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
- **Framer mounts one variant at a time and swaps it on scroll.** A single `getBoundingClientRect` read therefore proves nothing — the DOM may hold the one variant that is already correct while the broken one is what the user sees. Sweep several scroll positions and record the owning variant with every measurement (walk ancestors for `data-framer-name`, or read the `framer-v-*` class). This produced three separate false "it's fixed" conclusions on 2026-10-01.
- **Typing a number into a `Fit content` (or any non-Fixed) size field silently converts the type to `Fixed`**, and it then publishes as a hard px value. This broke the Elements card twice. After typing into any size field, re-check the type dropdown.
- **`<select>` reads via JS are stale after a selection change** — noted above for Position Type, but it applies to *every* panel dropdown. A height select reported `Relative` while a screenshot plainly showed `590 Fixed`. Screenshot anything type-related; never trust `select.value` / `selectedIndex`.
- To set a `<select>` from JS use the native setter plus `input` + `change` events: `Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(sel, v)`. Switching a size type this way **carries the old value across** (590 Fixed became 295% Rel), so set the number afterwards.
- **Typing into a focused panel number field fails silently maybe half the time** — the field keeps its old value with no error. Always read the input back before moving on; several publishes were wasted on edits that never landed.
- **The layer tree's disclosure arrow is the 6x6 svg to the left of the label**, not the 12x12 type icon beside it. Clicking the icon toggles the wrong row.
- **Driving the layer tree by coordinate is unreliable**: the screenshot frame and the DOM's CSS pixels differ (e.g. frame 1459x812 vs CSS 1536x799), so clicks land a row off. Locate rows via the DOM and dispatch pointer/mouse events on the element itself.
- Expanding a tree row re-renders the list, so **batched clicks land on pre-render positions**. One expand per call, then re-read the rows.
- Framer's **Preview opens in a separate window, not a tab**, so it cannot be measured from here. There is no publish-free feedback loop — every layout check costs a publish. Plan edits to minimise round trips, and record current values before changing anything.
- The publish popover's **"No changes" can be wrong**: an edit sat in the document (surviving a full editor reload) while the panel still read "No changes". Re-entering the value as a genuinely different number registered it. Treat "No changes" as a hint, not proof.

- **Measuring a hover/variant end-state without the animation: swap the class.** Animations never run in this environment, so hovering proves nothing. Instead find the component root (the element carrying a `framer-v-*` class), record the rects, then `root.classList.remove(old); root.classList.add('framer-v-1rizoid')`, wait ~500ms, re-measure, and restore. The CSS for that variant applies immediately, so this gives the exact hover end-state. This is what finally isolated the 74.6px image slide on 2026-10-02 after several rounds of wrong conclusions drawn from reading CSS rules.
- **Read class names from the live DOM, not from selectors.** Framer emits combined rules like `.framer-v-1rizoid .framer-u1j3y9, .framer-v-3q8m7a .framer-15m2r2a, …{width:150%}`. Skimming one of those led to "stock has no 100% override" — wrong, and it cost a publish. Get each element's own class via `[...el.classList]` on the rendered page first, then grep the stylesheet for exactly those classes.
- **Comparing against the stock Ora template is the highest-value move** when something looks off in a template-derived component. Stock published site: energized-personalization-419445.framer.app; stock editor: framer.com/projects/Ora-official--idoYUmcTUjWl1zFENTWM-5iPzt. Diff the published rules, or read the same layers in both editors.
- **The aspect lock converts size types.** On a layer whose width/height are both Relative, engaging the lock rewrites them to Fixed px (seen on the right `Video` container: `100%/100%` became `100%/200`). Leave that layer unlocked. On Fixed-height layers the lock behaves and drags the other dimension proportionally, which is how to change one and keep the ratio.
- Editing a `%` width whose partner is a Fixed height **drags the height**, so a later "revert the width" leaves the height stale. After reverting a percentage, check the height too — on 2026-10-02 the widths self-reverted to `100%` while the heights kept the bled value, leaving a half-applied change in the published build.
- **A LOCKED Height field displays a number unrelated to the stored ratio.** On 2026-10-02 all three hover `Image`/`Video` layers displayed `170.2741703` while storing three *different* aspect ratios. Typing into that field under an engaged lock publishes nothing, and **reading the input back afterwards proves nothing** — the field happily shows what you typed. Only two things reveal the truth: **opening the lock** (the field snaps to the real stored px value) or a **full page reload** (which clears the stale display). The one authoritative check is the published `aspect-ratio` in the live CSS.
- **Property-label colour tells you the scope of a value, and the three are easy to confuse.** Grey `rgb(204,204,204)` = inherited, nothing set here. Purple `rgb(136,85,255)` = a **variant** override. Blue `rgb(0,153,255)` = a **breakpoint** override. Reading the colour is the quickest way to answer "will editing this bleed into the other breakpoints / variants?" — and after an edit it is how you confirm the change landed where you intended rather than on the base. Verified 2026-10-02 when scoping a CMS limit to Phone only.
- **Right-click -> Reset override is not reachable by automation.** Tried on the `Height` label, on the value field, and with a prior hover; no context menu ever appeared (the right-click on the field just selects its text). Either do it by hand, or use **open lock -> type Height -> re-lock**, which rewrites the stored ratio and does work.
- **Never send `computer type` at a panel field without confirming focus first** — if the panel is not focused the digits are swallowed as canvas shortcuts. On 2026-10-02 typing `171.1255411255411` at an unfocused panel switched the whole editor into the **CMS** view. Focus the input via JS (`inp.focus()`), assert `document.activeElement` is that INPUT, and prefer the native setter + `input`/`change`/Enter events over keystrokes.
- **A canvas click by coordinate can land in the Pages panel and navigate away.** The left panel silently reverts from Layers to Pages, so a stale coordinate opened `/elements` mid-edit. Re-screenshot immediately before any coordinate click, and confirm which tab the left panel is on.
- **When something washes out, disappears or "looks wrong" in one variant, read that layer's `Styles -> Opacity` in that variant FIRST.** On 2026-10-02 three publishes were spent on geometry and on a missing video binding for what turned out to be a single `Opacity: 0.11` override on one `Image`. A purple property label means an override exists in the variant you are looking at — scroll the Styles section into view and read every row, not just Size.
- **Class-swapping does NOT reproduce a hover.** It applies the variant's CSS, which is enough for geometry, but Framer's JS variant switch also remounts children, swaps bindings and writes motion styles — none of which happen. So a class-swap can render a state as perfectly fine while the real hover is visibly broken. Hover-specific defects must be found by reading layer properties in the editor, or confirmed by a human in a real window. Do not conclude "the end state is correct, therefore it's fixed."
- **Renaming a layer or variant DOES work under automation** — an earlier note here claimed it did not, and that was wrong (corrected 2026-10-02 after renaming both 6th-pair variants this way). Single-click the row, then **double-click the row label**: a real `<input>` appears in the layer tree carrying the old name, and because the tree is in the main document (not the canvas iframe) you can confirm it with `document.activeElement.value` before sending a key. Then `Ctrl+A`, type, `Enter`. `Ctrl+A` is safe here precisely because focus is in that input — check `activeElement` first, or it hits the canvas and opens the delete dialog.
- **Editing canvas text works the same way, but blind.** Double-click the word on the canvas and Framer selects that word; typing replaces it. You cannot verify focus first because the canvas is a cross-origin iframe, so take a screenshot after the double-click and look for the selection highlight before typing. Text content is **shared across variants** unless explicitly overridden — one edit changed the menu label on both `Variant 1` and `Desktop Full Menu`.
- **A rename publishes as "1 change" even though names are not emitted.** Harmless, but it means a tidy-up rename leaves the project dirty; publish it or expect it to ride along with whatever you do next.

## Verified baseline — 2026-10-02

Known-good published state of **fulfilled-development-106906.framer.app**, measured after the last publish of the day (class prefix `framer-U4lA5`; the prefix changes every publish, so match on the layer classes, not on it). Anything that disagrees with this is a regression.

**Home projects row — every emitted `aspect-ratio` is `1.17458`:**

```
base          .framer-15m2r2a            1.17458 / width 120%
base          .framer-u1j3y9             1.17458 / width 120%
base          .framer-q1bc20-container   1.17458 / width 120%
base          .framer-zff0ca-container   1.17458 / width 120%
v-1rizoid     .framer-15m2r2a            1.17458 / width 100%     (left card hovered)
v-1rizoid     .framer-u1j3y9             1.17458 / width 150%
v-1rizoid     .framer-zff0ca-container   1.17458 / width 150%, right -1px
v-3q8m7a      .framer-u1j3y9             1.17458 / width 100%     (right card hovered)
```

`v-1rizoid .framer-q1bc20-container` and `v-3q8m7a .framer-zff0ca-container` emit **no rule at all** — those are the two hover `Video` layers now set `Visible: No`. If either reappears, someone re-enabled a video layer.

**Measured geometry at 1536 wide, all three states:**

| State | Left card | Right card | ar | Overlay tracks image |
|---|---|---|---|---|
| Resting | 761.11 | 761.11 | 1.17458 | yes |
| `v-1rizoid` (hover left) | 761.11 | 761.11 | 1.17458 | yes |
| `v-3q8m7a` (hover right) | 761.11 | 761.11 | 1.17458 | yes |

Images are `894 x 761.11` throughout, identical on both sides in all three states. These numbers superseded the earlier 761.63 set when the row gap went 15 -> 16 on 2026-10-02 (see below) — the cards are half a pixel narrower, so the height follows through the aspect ratio. What matters is that the two sides match exactly, which they now do to the hundredth.

**Navigation:** first menu row reads **`Fixtures`** and links to `./products` (label renamed 2026-10-02; the slug was deliberately left alone).

**There are TWO projects-row components, not one — mirror every change across both (found 2026-10-02).**

| Component | Published hash | Renders on Home as |
|---|---|---|
| `Home - Projects Row` | `framer-FHOjC` | the two-up **Fixtures / Elements** cards |
| `Home - Projects Row 2` | changes per publish (was `framer-D4P7g`, then `framer-8Ouu1`) | the full-width **case-study** card (`Home Project Single - Wide`) |

Both live in Assets -> Project (`Row 2` sits at the top level, not inside the `Home` folder) and **both carry the same nine variant names** — `Home Projects - Initial State`, `… Left Open`, `… Right Open`, `Before Scroll State - Below Hero`, `Home Project Single - Wide`, `… Tablet`, `… Mobile`, `Home Project Single Wide - Mobile`, `… Tablet Below Hero`. Identical layer trees inside. It is very easy to edit one, verify the live page, and conclude the job is done.

**How to tell them apart on the published page:** walk up from a `Product Card` to the ancestor carrying a 5-character `framer-XXXXX` class. Two different hashes means two different components. Do not match on the variant name — both use the same names.

In both components the gap pattern was identical: the base variant at 15 **not** overridden, and `Left Open` / `Right Open` each carrying their own purple 15. Both were set to 16, and both `Product Card` radii to 10, on 2026-10-02.
**Row gap is 16, not 15, and it must stay even (changed 2026-10-02).** A faint vertical line was visible in the gutter between the two cards. It is not an element — the gutter contains no DOM at all. It was **sub-pixel antialiasing**: at `devicePixelRatio` 1.5 the inner edges landed on fractional device pixels and the browser blended them.

```
gap 15 :  card 745.5   left edge 760.5 -> 1140.75 device px   right edge 775.5 -> 1163.25   both blurred
gap 16 :  card 745     left edge 760   -> 1140    device px   right edge 776   -> 1164      both exact
```

**An odd gap can never satisfy both edges at once.** Solving for whole device pixels at 1.5 dpr: with gap 15 the left edge needs `viewport = 3 (mod 4)` and the right edge needs `viewport = 1 (mod 4)` — contradictory, so at *every* viewport width one of the two inner edges is blurred, and which one flips as you resize. With gap 16 both edges need `viewport = 0 (mod 4)`, i.e. they share a phase. This is the same even/odd trap as the menu dividers, on the horizontal axis.

**Set the gap on all four variants, not just the base.** `Home Projects Left Open` and `Home Projects - Right Open` each carried their own purple `15` override. Leaving those would have made the gap *animate* 16 -> 15 on hover, shifting both inner edges by a pixel mid-transition — worse than the original. All four now read 16.

The hover states still land on half-device-pixels (`909 -> 1363.5`), which is a uniform 50% blend rather than the old asymmetric 0.75/0.25 — better, but intermediate widths during an animation are fractional by nature and cannot be made exact. Whether this is what caused the reported "narrowing on the inner edge while the hover settles" is **unconfirmed** — it is a measured sub-pixel defect at exactly the right location, but the animation itself still cannot be observed from an automated tab.
**Card corner radius — a deliberate divergence from stock (2026-10-02).** Stock Ora ships the left card's `Product Card` at **`border-radius: 0`** while the right card's is **`10px`**, so the left card has square corners sandwiched between a rounded `Project Left` (10px) parent and a rounded `Image Wrapper Left` (10px) child. It reads as a template oversight, not a design choice. **We set the left `Product Card` to `10px`** on the base variant of BOTH row components (see the two-components note above) so every card matches; it cascades to the hover and breakpoint variants. Our site now intentionally differs from stock here — **do not "restore" it to 0**.

Verify it with an element probe rather than by eye: sample `elementsFromPoint(card.left + 2, card.bottom - 2)` and the same at `right - 2`. A 10px radius puts that point outside the shape, so a correct card returns the **row background**; a square-cornered one returns **`Product Card`** itself. Reading zoomed screenshots for this is unreliable and produced a wrong call on 2026-10-02 before the probe settled it.
**CMS, re-read and clean 2026-10-02:** Home = 2 (`Fixtures` Live / `polestar` / 1, `Elements` Live / `arrival` / 2). Projects = 10, three Live at Sorting Order 1/2/3 (`positive-energy`, `first-round`, `the-leader`, all with Next Project 1 = 1 and 2 = 2) and seven Draft at 4–10. Fixtures = 11, Elements = 5, News = 7.

**How to re-check.** Open the published page, scroll to ~1300, then class-swap the row root through `framer-v-1rizoid` and `framer-v-3q8m7a`, measuring the enclosing `Product Card` each time (see the class-swap gotcha). Remember this only validates CSS-driven geometry — it cannot reproduce a hover, so anything animation- or binding-dependent still needs a human in a real window.

**Four long-standing "known-open" items were re-tested on 2026-10-02 and are stale — do not re-open them without re-testing first:**

| Item as recorded | Actual state |
|---|---|
| `Navigation Desktop` `Click -> Tap 2` swallows the logo's home link | **Works.** The logo publishes as `<a href="./">`, nothing covers it (`elementFromPoint` resolves to the anchor), and a real click took `/projects-list` -> `/`. The nav containers are plain `div`s with `cursor: auto`. |
| `/projects-list` reports collection-filter errors | **None.** No error text anywhere in the editor UI, no error badges on the canvas, and the published page renders `Main` 878 tall with a 478px `Projects List` and all three rows. |
| `Before Scroll State` redundant `120% / 204.329` override | **Gone.** Both labels read grey (not purple) at `120% / 203.504`, i.e. the base values, so there is no override left to reset. |
| Static "(3)" count label is wrong | **Correct as it stands.** It reads `(3)` and there are exactly 3 Live projects. It is still *static*, so it does need editing by hand whenever that count changes — but nothing is wrong today. |

**The "Made in Framer" badge is not a canvas layer.** It is `#__framer-badge-container`, injected by Framer's platform into the published page (an `<a>` reading "Create a free website with Framer…"). It cannot be deleted in the editor or by removing layers — it goes away with a paid Site Plan on the domain. The old `FramerButton` component was a third-party badge-hider hack; its 12 instances were deleted 2026-10-02 and the code file itself was removed from Framer 2026-10-05.

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

- **LAUNCH BLOCKER — the legal pages existed on `Alkimi (teaser)` ONLY (found 2026-10-05; pages now rebuilt, see below).** www.alkimiworks.com has exactly three pages (`/`, `/terms`, `/privacy`, both effective 8 July 2026). `Alkimi (Shak)` had 16 and **none of them was legal** — both slugs returned **404** on staging, and nothing legal existed anywhere in this repo's git history. **The cutover would therefore have deleted both policies**, while the new site ships a Formspark form collecting name, email and message with no notice and nothing to link to. Text captured verbatim to [legal/privacy.md](legal/privacy.md) (**9** sections as published) and [legal/terms.md](legal/terms.md) (**10**), so it no longer depends on a project that is being retired. **The remaining blocker is not the pages — it is that nothing links to them, and that neither has had legal review.** The linking is bundled into the stock-template cleanup below.
- **LEGAL PAGES — built 2026-10-05, UNPUBLISHED DRAFTS.** `/privacy` and `/terms` now exist on `Alkimi (Shak)`, cloned from `/404` (chosen because its `Main` holds a single `Container`, and its `GlobalScrollbarHider` is already `position: absolute`, so that fix came along for free). Both are **`draft: true`** — set explicitly, because `WebPageNode.clone()` returns `draft: false` despite the docs. They will NOT ship until someone clears that flag. Layout: `Left Content` = title + kicker + effective date; `Right Content` = intro, then one frame per section holding an `h2` heading and a body paragraph. Privacy has **8** sections, terms **10**. Text came from [legal/privacy.md](legal/privacy.md) / [legal/terms.md](legal/terms.md) programmatically — nothing was retyped. **The QuickBooks/"Opus" clause was dropped on Shak's instruction (2026-10-05)** and the remaining privacy sections renumbered 1-8; that disclosure describes Opus, the internal quoting tool, not this marketing site. Terms is carried over unchanged. **Neither page has had legal review.**
- **PRE-LAUNCH — stock Ora template cleanup (one bundle, deferred here 2026-10-05 on Shak's call).** Staging is still substantially the stock template, and the two outstanding legal-page links were folded in here rather than done separately, because all of it is hand work in the editor on published pages. The list:
  - `<title>` still reads **`Ora® — Agency Framer Template`**.
  - The Instagram link still points at **`instagram.com/ena.supply`**.
  - All three news articles are the template's own (Aesop, Mush Energy, "The making of an award-winning website").
  - `/contact` still shows **`hello@ora.com`** in `Main → Section CTA → Content Wrapper →` first `Stack`.
  - **Footer links to `/privacy` and `/terms`** — the sitemap column is `Footer / Footer` → `Stack` → `Row Bottom` → `Content` → `Right Content` → first `Column` → `Link Wrapper`, holding one `Stack` per link wrapping a `Text Link / Text Link - Underline` instance. Label and href are the instance controls **`UvO00kpP1`** and **`pN5qcoZCL`**. Three footer breakpoints: Desktop, Tablet, **Mobile**.
  - **A privacy link beside the contact-form submit** — target is `Main → Section CTA → Content Wrapper →` the **second** `Stack`, the one holding `FormSpark`, not the heading one.
  - **Clear `draft: true` on `/privacy` and `/terms`** when the links are in and the pages are approved. Until then they cannot ship, which is deliberate.

  **None of the last three can be scripted** — see the canvas-editing limits in the Agent CLI section: `parentId` is honoured only on draft pages, so on a published page or inside a shared `ComponentNode` the new node is silently dropped onto the Home page instead. Both were attempted on 2026-10-05, confirmed not to have persisted, and the strays removed; footer and `/contact` were verified unchanged afterwards. Flipping `/contact` to `draft` would make the API accept the edit, but that leaves a live page excluded from publishing if anything interrupts — not worth it for one line of text.
- Home page "First Round" project card has `Source: External` — should be `Projects`, which is why replacing its CMS thumbnail had no effect.
- **Mirror completeness and dead-file cleanup — both resolved 2026-10-05.** Framer's code panel held 14 files; `Pagination.tsx` and `FramerButton.tsx` were proven to have **0 canvas instances** and removed with `codeFile.remove()`. The repo and `Alkimi (Shak)` are now a **1:1 mirror of the same 12 files**, verified byte-identical (the only byte-count differences were CRLF in the repo's working tree). `framer-snapshot/` still holds all 14, so nothing is actually lost. The equivalent cleanup in `Alkimi (teaser)` is **not** done — both files are still there, also at 0 instances.
- The three Live projects still publish under Ora template slugs: Belmont Park at `/projects/positive-energy`, Resorts World at `/projects/first-round`, Tuft at `/projects/the-leader`. Pre-launch is the cheap moment to rename them; re-check the Home and nav links afterwards.
- Home projects row, hover: the ~4px card-height mismatch and the right card's vanishing photo are both **fixed and confirmed by the user 2026-10-02**. The one thing never confirmed either way is whether the cards still look momentarily narrow on their inner edge *during* the transition — the end state measures correct, so it is a transition question and needs a side-by-side screen recording, not CSS reading.
- Both cards' hover `Video` layers are now **`Visible: No`** (2026-10-02). Their `Source -> URL` was bound to a CMS field `Thumbnail Video URL - Wide` that does not exist on the **Home** collection, which Framer showed as a purple `Missing` pill on `Visible`. Hiding them also removed the last `aspect-ratio: 1.18045` outlier from the published CSS, since a hidden layer emits no rule. **If hover video is ever wanted, add the field to the Home collection, rebind, and set these back to `Visible: Yes`.**
- Seven Draft projects occupy `Sorting Order` 4–10, two of them duplicates (`Glossier Copy`, `Hyundai Motor Group Copy`) created 2026-10-01 purely to fill grid slots 9/10 in the canvas. They are invisible on the published site. If any go Live, the static "(3)" count label needs updating by hand.
