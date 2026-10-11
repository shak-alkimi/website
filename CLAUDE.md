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

- **AN AGENT CLI SESSION CAN SERVE A STALE DOCUMENT — start a fresh session before contradicting the user (found 2026-10-07).** After Shak deleted a variant **by hand in the editor**, the long-running `exec` session kept reporting it present across repeated reads. A **brand-new session** read the same component and correctly showed it **gone**. Nothing about the read was wrong; the session's snapshot was.
  - **This is not blanket staleness.** The same session *did* pick up a new image frame dropped on the canvas minutes earlier, so some changes propagate and some do not — do not assume a long session is either reliably live or reliably stale.
  - **The rule: if a fresh read contradicts what the user says they just did in the editor, open a new session and re-read before telling them it did not work.** On 2026-10-07 that mistake was made — the orphan variant was reported as still present when it had in fact been deleted.
  - Sessions are cheap: `npx @framer/agent@latest session new "<projectId>"`. Treat a new session as the first debugging step for any editor-side change, the way `exec`-level staleness is already handled by re-reading in a separate call.
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
- **`getParent()` returns `null` for component-internal nodes, not just for canvas-root nodes.** Do **not** treat "parent is null" as "orphan I created" — a cleanup heuristic built on that matched 18 real `Stack` layers inside components and called `removeNodes` on them. They survived only because `removeNodes` does not reach inside a component; on a draft page the same heuristic would have deleted real content. Identify your own nodes by a distinctive `name` prefix instead.
- **Mutating an EXISTING component-internal node DOES work — only creating and removing nodes inside a component fails.** `node.setAttributes({ … })` on a layer inside a `ComponentNode` persists correctly (verified across a fresh `exec` on 2026-10-05 when fixing the card radius). What does not work inside a component is `createTextNode` / `createFrameNode` / `addComponentInstance` with a `parentId` (silently relocated to the active page) and `removeNodes`. An earlier note here said component internals were immutable outright — that was wrong.
- **HOVER STATES *CAN* BE CREATED THROUGH THE API — `ComponentNode.addGestureVariant` works in this scope (proven 2026-10-06).** This is a real exception to "you cannot create things inside a component", and it was missed for a long time because the method is marked `@alpha`. It is **not** gated: `framer.isAllowedTo` does not even exist here, so the only way to know is to call it.
  ```js
  const gv = await componentNode.addGestureVariant(variantId, "hover")   // or "pressed"
  ```
  - **The first argument must be a VARIANT id, not an arbitrary inner node.** Passing an inner layer fails with **`"Based on variant not found"`** — a misleading message, since the parameter is documented as `nodeId - The ID of the node to add the state to`. That error is the tell.
  - The gesture state comes back as an ordinary `FrameNode` and then appears as an **extra child of the component**, carrying the **same `name` as the variant it was based on**. So `getChildren()` returns two entries with identical names — **key any audit by `id`, never by name**, or a dedup will silently collapse them (it did, once, and produced a reading that looked like the base variant had been overwritten).
  - Its inner nodes are addressable as usual: re-traverse from the gesture node and `setAttributes` on the layer you want. `Node.setAttributes` on component-internal nodes already worked; this just gives you a hover state to apply it in.
  - **Removal was not tested.** `removeNodes` does not reach inside a component, so assume a gesture state you create may only be deletable by hand in the editor, and do not create one speculatively.
- **`framer.getNode(id)` cannot resolve a component-internal id**, even an id you just read. It returns `null`. You must re-traverse from the `ComponentNode` to get a live handle, then call methods on that handle. Caching ids across `exec` calls does not work for anything inside a component.
- **Reads inside the same `exec` as a write are stale.** A `setText` verified immediately reports the new value, and a `removeNodes` immediately re-lists the removed nodes. Both resolve correctly when re-read in a **separate** `exec`. Never conclude success or failure without a fresh call — this produced one false "MISMATCH" panic and one false "cleanup failed".
- **`removeNodes` sometimes needs a second pass.** First call appears to do nothing (stale read), second call reports zero remaining.
- **`WebPageNode.clone({ path })` is documented as creating a draft but returns `draft: false`.** Set `draft: true` explicitly and verify, or the half-built page ships on the next publish.
- **The `H1` text style is white** (`rgb(255,255,255)`, built for a dark hero). Applied unmodified on a white `Main` it is invisible. Spread it and override `color`. Likewise `Article Title` is **Inter**, not General Sans — the semantic `h2` style `dQyDA_Lpr` is the General Sans one.
- **Image-valued attributes need a LIVE `ImageAsset`, and a hand-built object fails SILENTLY.** `setAttributes({ backgroundImage: {...} })` or a `poster` control set from a plain `{ id, url, thumbnailUrl, resolution }` literal **returns without error and stores nothing** — a fresh read shows the old image. `ImageAsset` is a class instance, not a plain object. **The working method: read the asset off a node that already holds it and pass that object straight through, in the same `exec`, with no `JSON.parse(JSON.stringify(...))` round-trip** — serialising it turns it back into a dead literal. Verified 2026-10-06 when repointing the Home hero poster: `const asset = droppedFrame.backgroundImage; await container.setAttributes({ backgroundImage: asset }); await video.setAttributes({ controls: { ...video.controls, poster: asset } })`. `framer.uploadImage()` returns a real `ImageAsset` if there is no node to copy one from. Note the contrast — **plain string controls (a video `srcUrl`) write fine**; it is specifically asset-typed values that need the live object.
- **Gradients: assignable only by BORROWING a live instance — not constructible, not mutable.** `setAttributes({ backgroundGradient: { angle, stops } })` from an object literal **fails silently** (write returns, fresh read shows `null`) — the same class-instance problem as `ImageAsset`. Assigning a **live** `LinearGradient` read off another node **does** work. But the instance is **immutable**: `live.stops = [...]` is accepted by JS and then ignored, so you get the donor's colours, not yours. Verified 2026-10-06 — a donor was assigned to `Section Projects`, which silently applied the donor's grey→white and had to be reverted. **So a gradient can only be set to one that already exists somewhere in the project.** A new gradient must be drawn **by hand in the Framer editor**. `framer.getNodesWithAttributeSet("backgroundGradient")` lists the donors; as of 2026-10-06 they are all overlay-style (transparent → black at the bottom) plus the hero's grey→white, so there is no dark→light donor to borrow.
- **A CMS image field takes a URL STRING, not an `ImageAsset` — the opposite of a node attribute (learned 2026-10-06).** `collection.addItems([{ id, fieldData: { [fieldId]: { type: "image", value: asset } } }])` with a live `ImageAsset` is **rejected loudly**: `invalid type on $input[1][0].fieldData.<id>.value, expect to be (null | string)`. Pass `asset.url` instead. So the two contracts are inverted and both are easy to get wrong:
  - **node attribute** (`backgroundImage`, a `poster` control) → needs a **live `ImageAsset`**; a literal or a URL fails *silently*.
  - **CMS image field** → needs a **URL string**; an `ImageAsset` fails *loudly*.

  The useful part is that the CMS one fails loudly, so it cannot ship wrong. Still verify in a separate `exec`, and note `fieldData[f.id].value` reads back as a **string** for CMS images, so a `.url` accessor on it yields `undefined` and a naive log prints `[object Object]` for the *old* value if you read it before the write.
- **A dropped video node carries TWO different asset URLs and the obvious one is usually wrong.** On a `Video` instance with `srcType: "Upload"`, the real file is `controls.srcFile.url`; `controls.srcUrl` holds a stale leftover. Both times a video was dropped on this project (2026-10-06) `srcUrl` pointed at a 2024 asset while `srcFile` held that day's upload. **Always take `srcFile.url` when `srcType` is `Upload`, and confirm with an HTTP `HEAD` — `last-modified` identifies the real drop unambiguously.**

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

The repo mirrors **all 8** code files in `Alkimi (Shak)` — a 1:1 mirror after the 2026-10-05 deletions (14 → 12 → 9 → 8). Instance counts are from the canvas, read 2026-10-05; **0 means nothing on the canvas renders it**, so changing it has no visible effect.

| File | Kind | Instances | |
|---|---|---|---|
| [GlobalScrollbarHider.tsx](GlobalScrollbarHider.tsx) | component | **34** | 1x1px, opacity 0; see the GlobalScrollbarHider note below |
| [VideoThumbnail.tsx](VideoThumbnail.tsx) | component | **6** | |
| [ProductsFilterPills.tsx](ProductsFilterPills.tsx) | component | **6** | products filter row |
| [FormSpark.tsx](FormSpark.tsx) | component | **3** | contact form; `formId` is **empty** on staging — see the production-form section |
| [Valide/Scroll_Progress.tsx](Valide/Scroll_Progress.tsx) | component | **0** | **Confirmed dead 2026-10-05.** The canvas uses a *remote* module instead — `module:tZ4BBLxqep75fqWPDP07/…/Scroll_Progress.js` — so editing this copy changes nothing. Its distinctive literals (`Scroll Progress`, `framer-motion`) appear in no published chunk. |
| [Copyright_year.tsx](Copyright_year.tsx) | override | — | **LIVE — do NOT delete.** An earlier note here called it unused; that was wrong. Its code is in the published bundle (`i.children.replace(`YYYY`, new Date().getFullYear())`) and it renders **`© Alkimi 2026`** on `/products` and `/elements`. `getFullYear` appears in no other local file. |
| [Share_blob.tsx](Share_blob.tsx) | override | — | **PARTIALLY LIVE — do NOT delete.** An earlier note said none of it was attached; that was wrong, because the check looked for share *URLs* and the attached export has none. **`Clipboard_Share` IS attached** on all 3 news article pages — the minified bundle matches this file's implementation exactly (aria-label `Copy link to clipboard`, `location.href`, `clipboard?.writeText`, textarea fallback). The other six exports (X, LinkedIn, Facebook, Email, WhatsApp, Tumblr) are tree-shaken out, i.e. genuinely unattached. |
| [ElementCounts.tsx](ElementCounts.tsx) | override | — | **LIVE — do NOT delete.** All six count overrides are bundled into the `/elements` + `/products` chunk, verified 2026-10-05: `Connector List`, `Driver List`, `LED List`, `Profile List`, `Flex List`, `Optic List` each appear in 2 published chunks. |

Override usage **cannot be read through the node API** — see the Agent CLI gotchas for the bundle-scanning method used above.

**How to decide whether a code file is actually live — the method, and the two traps that make naive checks lie (established 2026-10-05).**

1. **For `component` files, the canvas instance count is authoritative.** `framer.getNodesWithAttributeSet("componentIdentifier")` matched against `"local-module:" + export.componentId`. Zero instances means dead, and that covers draft pages the HTTP sweep cannot see.
2. **For `override` files there is no API at all** — overrides carry no node attribute. The only method is scanning the published JS bundles. Collect every `.mjs` referenced by **every** page, **including the CMS detail pages** (`/news/{slug}`, `/projects/{slug}`) — they load chunks no listing page does, and that is exactly where `Share_blob` turned out to live.
3. **TRAP 1 — identifiers are minified, so searching for export or constant names is worthless.** Scanning for `FIXTURES_FILTER_OPTIONS`, a constant in the demonstrably live `ProductsFilterPills`, returns **0 chunks**. Searching for `withConnectorCount` likewise returns 0 while that override is live. **Only string literals survive minification.** Always validate the scan against a literal from a file known to be live before trusting a zero.
4. **TRAP 2 — Framer tree-shakes per export, not per file.** `Share_blob.tsx` exports seven overrides; only `Clipboard_Share` is attached, and only its code is bundled. A file can therefore be *partially* live. Scanning for literals from the unattached exports (`Share on LinkedIn`, `api.whatsapp.com`) returns 0 and looks like proof the whole file is dead — which is precisely the wrong conclusion that was recorded here before.
5. **Overrides are bundled into a page's chunk, not their own.** `ElementCounts` and `Copyright_year` both live inside `ProductsFilterPills.*.mjs`. Do not expect a chunk named after the file, and do not infer anything from chunk filenames.
6. **Confirm a positive by matching the implementation, not just a string.** The minified clipboard code was lined up against this repo's `Clipboard_Share` source — same aria-label, same `location.href`, same `clipboard?.writeText` path, same textarea fallback — before calling it live. And confirm by rendered output where possible: `Copyright_year` was settled by finding `© Alkimi 2026` on the page.

Applying this on 2026-10-05 **overturned three of five recorded verdicts**: `Copyright_year` and `ElementCounts` are live, `Share_blob` is partially live, and only `Counter` and `Valide/Scroll_Progress` are genuinely dead.

**Deleted from Framer and the repo 2026-10-05 — `Counter.tsx`** (3,662 bytes, `NumberCounter`, an IntersectionObserver number counter). A component with **0 canvas instances**, and its distinctive literal `End Number` appeared in none of the 48 published chunks. Framer went 9 code files → **8**; the repo matches. Two versions remain recoverable: the post-audit one in git history, and the **pre-audit** one in `framer-snapshot/Counter.tsx` (they differ — see the snapshot note below).

**`Valide/Scroll_Progress.tsx` is KEPT DELIBERATELY as reference, despite being dead** (Shak's call, 2026-10-05). It has 0 canvas instances and the canvas renders a *remote* module instead — `module:tZ4BBLxqep75fqWPDP07/…/Scroll_Progress.js` — so **editing this file changes nothing on the site**. It is retained only as readable source for what that remote component does, since a remote module cannot be read any other way. Do not delete it as "dead code", and do not expect edits to it to have any effect.

**Deleted from Framer and the repo 2026-10-05 — the three dead filter files:** `ElementsFilter.tsx` (7,602 bytes, a component with **0 canvas instances** — an earlier standalone implementation superseded by the unified `ProductsFilterPills`), and the sessionStorage deep-link pair `ProductElementsLink.tsx` (984 bytes) and `ProductsFilterAutoSelect.tsx` (1,480 bytes), **neither of which was attached to anything**. Verified before deleting by scanning **all 43 JS chunks referenced by all 10 published pages** for six distinctive strings (`products-filter`, `withElementsProductsLink`, `withProductsFilterAutoSelect`, `Elements filter`, `Tab Pad X`, `Active BG`) — **0 hits**, with the scan validated against the live filter component, which 3 chunks do reference. Framer went 12 code files → **9**; the repo matches. All three survive verbatim in `framer-snapshot/` and in git history.

**Why the deep-link pair was not worth repairing.** `ProductElementsLink` set `sessionStorage["products-filter"] = "Elements"` and sent the visitor to `/products`; `ProductsFilterAutoSelect` then clicked the first visible element whose text was exactly `"Elements"`. **There is no "Elements" pill on `/products`** — its options are All / Flex / Profile / Optic — so it would have matched the navigation link and bounced the visitor to `/elements`. It was written against a filter layout that no longer exists. The Home category cards now navigate with plain `./products` and `./elements` hrefs, which is why the pair had already been detached. If deep-linking to a filter is ever wanted, write it fresh against the current pills; do not restore these.

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
| **Fixtures** | Line Mobile Menu 1 Active | 1.2 | 0.2 |
| Elements | Line Mobile Menu 2 Active | 1.2 | 0.35 |
| Projects | Line Mobile Menu 3 Active | 1.2 | 0.5 |
| About | Line Mobile Menu 4 Active | 1.2 | 0.65 |
| News | Line Mobile Menu 5 Active | 1.2 | 0.8 |
| Contact | Line Mobile Menu 6 Active | 1.2 | 0.95 |

Easing is `0.65, 0, 0.13, 1` on all six (copied from the Newsroom divider on Home). Full sweep completes ~2.1s; measured live 2026-09-30.

**TIMING TABLE VERIFIED ON THE LIVE SITE 2026-10-05 — it is correct. Previously marked unverified; that caveat is withdrawn.** Measured by arming a `requestAnimationFrame` sampler in the published page and having a human open the menu on a foregrounded Chrome tab (630 samples). Each divider's inner `Line` width was tracked from 0 to 1506.

| Divider | Starts drawing (from menu mount) | Gap to previous |
|---|---|---|
| Menu 1 Active | 330 ms | — |
| Menu 2 Active | 480 ms | **150** |
| Menu 3 Active | 631 ms | **151** |
| Menu 4 Active | 781 ms | **150** |
| Menu 5 Active | 930 ms | **149** |
| Menu 6 Active | 1080 ms | **150** |

**The stagger is 150 ms, within 1 ms on every step** — matching the table's delays, which are all `0.15` apart. The measured offsets run a **constant +130 ms** above the recorded values (330 vs 200, 480 vs 350, and so on), which is the lag between the menu mounting in the DOM and the appear clock starting; it is identical for all six, exactly as a fixed overhead should be.

**Draw duration is consistent with the recorded `Time 1.2`.** Each line reaches 50% at ~384 ms, 99% at ~900 ms and 99.9% at ~1017 ms from its own start — the asymptotic finish expected from `cubic-bezier(0.65, 0, 0.13, 1)`. The nominal endpoint cannot be observed directly, only the asymptote, so 1.2 is *consistent with* rather than *proven by* this measurement.

**Full sweep: first line starts 330 ms, last completes ~2097 ms -> ~2.1 s** — the exact figure recorded by hand from the editor panel on 2026-09-30, reproduced here by a completely independent route.

**The variants fire in strict ascending order 1 -> 6, top to bottom, so they are correctly labelled.** Combined with the rendered-position measurement above, the menu cascade is confirmed correct end to end: right variant, right row, right order, right timing.

**How to repeat this.** The constraint is that `requestAnimationFrame` only runs while the Chrome tab is **foregrounded**, and Framer's menu toggle ignores untrusted events, so neither `element.click()` nor JS-dispatched `PointerEvent`s will open it — and a CDP `computer left_click` opens it but does **not** foreground the tab. The working recipe: with the menu closed, arm a dormant rAF sampler via `javascript_tool` (it cannot tick while hidden, so it simply waits), then ask a human to click the tab and then the hamburger, then read `window.__cap` back afterwards. The samples persist in the page, so the human can switch away as soon as the cascade finishes.

**Two delays used to stack.** Each idle variant also has an Appear interaction (Interactions → Appear → the Active variant) with its own Delay. Those are all set to **0** so the stagger has a single source of truth in the variant Transition. If a line starts late, check both.

**Desktop and mobile share these variants.** `Mobile Full Navigation` has two variants — `Variant 1` (mobile/tablet, via `Navigation Mobile`) and `Desktop Full Menu` (≥1200px). Each has six `Line` wrappers each holding a `Global / Line Animation Global` child. **Both breakpoints render their dividers in correct row order on the live site — measured 2026-10-05, see below. Do not reassign them, and do not treat the canvas sibling order as the row order.** Because the variants are shared, a timing change applies to both automatically.


**MEASURED ON THE LIVE SITE 2026-10-05 — the desktop dividers are in perfect row order. There is no defect, and there never was. Ignore any earlier note on this page claiming otherwise.**

Read from the published DOM at 1536 wide, each element by its own `getBoundingClientRect`:

| Row label | Its divider | Divider top |
|---|---|---|
| Fixtures @305.17 | `Line Mobile Menu 1 Active` | 356.67 |
| Elements @365.17 | `Line Mobile Menu 2 Active` | 416.67 |
| Projects @425.17 | `Line Mobile Menu 3 Active` | 476.67 |
| About @485.17 | `Line Mobile Menu 4 Active` | 536.67 |
| News @545.17 | `Line Mobile Menu 5 Active` | 596.67 |
| Contact @605.17 | `Line Mobile Menu 6 Active` | 656.67 |

Pitch is exactly **60** between every pair, and every divider sits exactly 51.5 below its label. Shak independently confirmed the cascade is correct on both breakpoints.

**THE TRAP THAT PRODUCED A FALSE POSITIVE — do not repeat it.** An Agent CLI audit read `Link Wrapper`'s children in `Desktop Full Menu` and found the assignment order `1, 6, 3, 4, 5, 2`, and concluded rows 2 and 6 were swapped. **That inference was wrong.** These layers are `position: absolute`, so **the canvas layer-tree order is NOT the visual row order** — `querySelectorAll` on the published page returns the same `1, 6, 3, 4, 5, 2` document order while the elements are *placed* 1 through 6 down the page. Index 2 in the layer tree is not "the divider under Fixtures".

**The rule: for anything positional in this project, measure the rendered element's own rect. Never infer row order from sibling index.** The canvas tells you what exists and what it is bound to; only the live DOM tells you where it is.

The published DOM also exposes the resolved variant directly — each divider wrapper contains an element carrying `data-framer-name="Line Mobile Menu N Active"` — so "which variant is this row actually rendering" is answerable in one query and never needs to be inferred again.

**Divider rendering, measured (answers the old "desktop dividers read heavy" question).** Each divider is `1 CSS px` tall at `devicePixelRatio` 1.5, so **1.5 device px**, and all six sit at whole-number device tops (493, 583, 673, 763, 853, 943). A 1.5px line starting on a whole pixel paints one solid device row plus one at half intensity — heavier than a hairline, but **identical on all six**, which is the even-pitch property working as designed. There is no alternating thick/thin. The line colour is `rgba(255, 255, 255, 0.2)` on the inner `Line`; that opacity is the lever if they should read lighter, not the height.

**Frame widths are not all identical, contrary to the note above.** 14 of the 16 variants are `787 x 1`, but **`Line Animation` and `Line Animation Active` are `786.5 x 1`**. Those two are the pair driving the Home Newsroom divider, not the menu, and the instance stretches responsively so the runtime effect is probably nil — but the claim "every one of the 16 frames measures 787 x 1" is wrong.

**Everything else in the menu is symmetric and matches this file** (audited 2026-10-05): both variants have 13 `Link Wrapper` children, rows at `45px`, dividers at `1px` / `1fr`, every opacity `1`, every layer visible, `Link Wrapper` gap `7px` on both — pitch `45 + 1 + 14 = 60`, even, as required.

**Unrelated oddity in the same area:** `Navigation / Navigation Desktop` has 11 variants, two of which are both named **`Nav white`** (positions 1 and 8). Harmless, but it makes referring to one by name ambiguous.

**Don't add competing Appear effects.** Both breakpoints previously had an instance-level Effects → Appear (opacity + offset) on each divider fighting the width draw. All twelve were removed.

**The full variant inventory is 16** (counted 2026-10-02): `Line Animation` (Primary), `Line Animation Active`, `Line animate on appear`, `Line Active`, then `Line Mobile Menu 1…5` with their five `… Active` partners, then `Line Mobile Menu 6 Active` and `Line Mobile Menu 6`. **They are NOT all the same size** — an earlier version of this line claimed every one of the 16 measures `787 x 1`, and that is wrong: **14 are `787 x 1` and `Line Animation` / `Line Animation Active` are `786.5 x 1`** (read from the canvas 2026-10-05; those two drive the Home Newsroom divider, not the menu). Otherwise the only differences between them are the child `Line`'s Width (0% idle -> 100% active) and the Transition timing.

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

### Elements card — why its object sat off-centre on tablet and phone (fixed 2026-10-06)

Shak reported that on tablet and phone the product object in the **Elements** card was not centred above the word "Elements", while desktop was correct.

**The cause is the source image, and desktop was only centred by accident.** `UjMpyh3RsttSP0DzGSEJHP0AmQ.png` is **2000 x 1800** and the product sits at about **58%** of the width, not 50%. Every breakpoint renders that same asset with `object-fit: cover; object-position: center`, so the only thing that differs is the box it is poured into:

| | image width | aspect | wrapper anchor | object lands at |
|---|---|---|---|---|
| Desktop | **120%** | 1.17458 | `flex-end` | `0.58 x 1.2W - 0.2W` = **0.496W** — centred |
| Tablet | 100% | 0.780612 | `flex-end` (no effect) | **0.614W** — 11.4% right |
| Phone | 100% | 0.734694 | `flex-end` (no effect) | **0.621W** — 12.1% right |

**At `width: 100%` the image exactly fills the card, so there is no overflow and the `flex-end` anchoring does nothing.** Desktop's 120% overflow, pulled to the outer edge, happens to cancel the image's own 8% offset almost exactly. That is why the same asset reads centred on one breakpoint and skewed on the others — nothing about the alignment settings differs; they are byte-identical across breakpoints (`place-content: center flex-end` on the right wrapper everywhere).

**Fix: give tablet and phone the same mechanism, and solve for the width rather than guessing it.** Since rendered height is `width / aspectRatio`, changing both together leaves height untouched. The width that centres the subject is:

```
k = 1 + 2 * sigma * (f - 0.5)          sigma = sourceAspect * h,  h = boxHeight / cardWidth
newAspect = k / h                       (keeps rendered height identical)
```

**`f` was measured, not estimated** — the PNG was decoded (zlib inflate + un-filter + palette lookup) and a per-column ink profile taken against the background sample. The subject's bounding box is **x 817 .. 1514 of 2000**, midpoint **1165.5**, so **`f = 0.58275`**. Use the bounding-box midpoint, not the ink centroid (`0.607`), which is dragged right by the denser second component and is not what the eye reads as centred.

| variant (Row 1, RIGHT image only) | width | aspectRatio | subject offset |
|---|---|---|---|
| `Home Projects - Tablet` | `100%` -> **`125%`** | `0.780612` -> **`0.975765`** | **-0.72%** |
| `Home Projects - Tablet Below Hero` | `100%` -> **`125%`** | `0.780612` -> **`0.975765`** | **-0.72%** |
| `Home Projects - Mobile` | `100%` -> **`126%`** | `0.734694` -> **`0.925714`** | **-0.49%** |

**These sit a HAIR LEFT of mathematical centre, settled by eye over three publishes and CONFIRMED BY SHAK AS CENTRED (2026-10-06).** Solving for offset 0 gave `124%`/`125%`; Shak asked for further left (raised to `127%`/`128%`, which overshot), then back right by 1% to here. **Treat these as final unless asked — the arithmetic optimum is not what was wanted, the eye preferred a touch left.** **`d(offset)/dk = -0.5`, so +2 points of width = 1% of card width to the LEFT** — that is the tuning knob, and it is linear, so any further request converts directly. Always change `aspectRatio` with it (`newAspect = k / h`) or the card height moves.

**Use INTEGER widths.** The Agent API's read rounds `width` to whole percent and `aspectRatio` to 3 dp, so a fractional width written as `123.550%` reads back as `124%` and there is no way to tell from the API whether the fraction was stored. Integer widths make the stored and displayed value the same under either behaviour. **The published build settles what storage actually does: it keeps FULL precision** — the live CSS emits `aspect-ratio:.975765` and `.925714`, the exact values written, while the API read showed them as `0.976` and `0.926`. So the rounding is display-only, but it is still invisible through the API, which is why the integer-width rule stands. Derive the aspect from the **left** card's exact *published* ratio (`0.780612` / `0.734694`), never from an API read.

Verified in a fresh `exec`: implied heights are `1.281046W` right vs `1.281045W` left (tablet) and `1.361111W` on both (mobile), so **the old card-height mismatch bug is not reintroduced**.

**The model was validated against a real device.** At the intermediate `120%` setting it predicted the subject sitting `+2.51%` right of centre on phone; Shak's handset screenshot measured roughly `+2.4%` on an ~820px-wide card. Agreement at that level is why the final width could be solved directly instead of tuned by eye.

**Why the Fixtures card needed nothing.** Its asset is `ZNDr58rLGauZUC5QuYpJBIDWaSk.png`, **775 x 775**, a full-bleed diagonal composition that runs off the edges. Re-cropping it just reframes a texture — there is no discrete object to sit off-centre. **This is the general rule: a card image with a small centred subject is sensitive to the crop maths; a full-bleed one is not.**

**Do NOT "fix" this by re-centring the PNG.** Moving the subject to 50% would break desktop, which depends on the 58% offset cancelling its 120%/`flex-end` overflow. Desktop would then read 10% left of centre.

**`Home - Projects Row 2` was deliberately NOT mirrored**, despite the standing rule to mirror both row components. Row 2 carries the same nine variants with identical values, but on Home it renders only the **full-width case-study card**, not the two-up Fixtures/Elements pair — so its `Home Projects - Tablet/Mobile` right image is not on screen anywhere that was verified. Changing an unrendered path risks a new defect for no gain. **If Row 2's two-up variants are ever brought into use, apply the same three edits there.**

**Not verifiable from this environment.** Chrome viewport emulation does not work here (the page keeps reporting `1536 x 855`), so the tablet and phone result is established by the crop arithmetic plus the stored values, not by measurement. **Confirm on a real device after publishing.**

### Hover "View Case Study" button (grid cards, and the Home wide card — added 2026-10-07)

The button is a **`Utilities / Primary Button`** instance (`local-module:canvasComponent/dzNJ99hkN:default`) with controls `XqpXZUGU6 = "View Case Study"` and `NhREodF7M = "/projects/:slug"`. It already existed, at `opacity: 0`, on both the grid card **and** the Home wide card — nothing had to be created.

**The reveal is a RISE plus a fade, not a fade alone — and the canvas diff does NOT show the rise.** A full attribute diff of `Grid Card` vs `Grid Card - Hover` across every layer reports **exactly one** difference, `opacity 0 -> 1`, with `bottom: -60px` on the button in *both*. That is misleading. Measured on the live site (ours and stock behave identically), the button's computed `bottom` goes **`-60px` -> `0px`** — a **60px rise** — alongside a transform carrying a Y offset and a scale ramp (`matrix(1, 0, 0, 1.30887, 0, 27.7981)` caught mid-flight).

**So the motion is driven by something the node API does not expose.** This is the horizontal twin of the `border-radius` lesson: the canvas is authoritative for *what exists and what it is bound to*, but **for anything animated, measure the rendered element**. A variant diff that comes back with a single property changed is a reason to go and look, not a reason to conclude the effect is simple.

**Geometry differs between the two cards, which is why the Home one needed more than an opacity flip:**

| | grid card button | Home wide card button |
|---|---|---|
| position | `absolute`, `bottom: -60px`, `centerX: 50%` | `absolute`, `top: 31px`, inside `CTA` (`absolute`, `bottom: 40px`, `centerX: 50%`, `zIndex 8`) |
| size | `fit-content` / `fit-content` | `1fr` / `30px` |

The grid button is parked **below** the card and rises into place. The Home button sat at its final spot with nowhere to travel, so an opacity flip alone would only fade.

**What was applied to `Home - Projects Row 2` -> `Home Project Single - Wide`:**

| | base variant `Q__AVxo4P` | hover gesture `uR6T4xhGK` |
|---|---|---|
| button `top` | `31px` -> **`91px`** | **`31px`** |
| button `opacity` | `0` | **`1`** |

`91 = 31 + 60`, so it rises the same 60px the grid card does and lands on its designed position. The resting change is invisible (`opacity: 0`, `position: absolute`, so it neither shows nor affects layout). Verified by variant id in a separate `exec`: the other eight variants remain `31px / 0`.

**FIRST ATTEMPT FAILED, AND THE REASON IS A GENERAL RULE: Framer only emits `top`/`bottom` for ABSOLUTELY positioned nodes.** The Home button was a flow child of the `CTA` column stack (`align-self: stretch`), so writing `top: 91px` on the base and `top: 31px` on the hover **stored fine on the canvas and published nothing** — the served CSS was `position: relative` with **no `top` at all**, and the live button measured `top: 0px`, `transform: none`. It faded without moving, exactly as Shak reported.

**The canvas read is what misled me.** It reported `position: "absolute"` on that node, while the published rule says `relative` — Framer's layout engine overrides the stored value for a stack child. **Treat a stored `position` as intent, not as what ships; the published rule is the authority.**

**The fix was to give it the grid card's structure rather than invent one:**

| | `position` | `bottom` | `centerX` | `opacity` |
|---|---|---|---|---|
| grid base | absolute | `-60px` | `50%` | 0 |
| grid hover | absolute | `-60px` | `50%` | 1 |
| **Home base** `Q__AVxo4P` | absolute | **`-60px`** | `50%` | 0 |
| **Home hover** `uR6T4xhGK` | absolute | **`0px`** | `50%` | 1 |

Home carries an **explicit** `-60px -> 0px` rise, which is the part the grid card gets from the effect the API cannot read. Also note `centerX` needed `left`/`right` cleared to `null` in the same write before it would store — setting it alone left `left: -13px` behind on one variant.

**Two consequences to check on the published page:**

- **The resting card will reflow.** The button is no longer a flow child, so the `CTA` stack loses its height plus the `24px` gap and the text block shifts. That is the same structure the grid card has, so it is a match rather than a regression — but it is a visible change to the resting card.
- **`pointer-events: none` was on the old published container rule** (`.framer-h6av0r-container`), and the grid card's equivalent does **not** have it. If it survives the change the button will be visible but unclickable. Verify a real click reaches `/projects/:slug`.

**Not replicated: the scale ramp.** The grid card's button also scales during the reveal; that comes from the effect the node API cannot see, so the Home version rises and fades without it. **Confirm by eye on the published page** — if it needs the scale, that is editor work.

**Card text removed, and the button colour is HALF DONE — the last step needs the editor (2026-10-07).**

**Text:** `CTA > Text Wrapper` (holding `Project` and the title layer still named `First Round`) set `visible: false` on the wide card's base **and** hover states only. Verified: the other eight variants still show it, including **`Home Project Single Wide - Mobile`**, which is the phone version of the same card — decide whether that should match.

**Colour — two API facts, one of them a silent failure:**

- **`ComponentNode.addVariant` WORKS** (alpha, like `addGestureVariant`). Created **`Button Alkimi Green - No Hover`** (`hLYcAEbg2`) on `Utilities / Primary Button`, based on the primary variant `PQb6JRcY1`, `backgroundColor: #35790B`. Verified in a separate `exec`.
- **A component instance's `variant` control is NOT settable.** `setAttributes({ controls: { variant: "hLYcAEbg2" } })` **returns success and stores nothing** — and the same is true passing the variant *name* instead of the id. It is a **silent** failure, in the same family as `ImageAsset` literals and gradient literals. Other controls were not tested, so this may be specific to `variant` or general to `controls`; **verify any control write in a separate `exec`.**

**So the green variant exists but nothing points at it.** To finish, by hand: open `Home / Home - Projects Row 2` -> variant `Home Project Single - Wide` -> `Project Left > Product Card > CTA >` the `Utilities / Primary Button` instance -> set its **Variant** property to **`Button Alkimi Green - No Hover`**. Do it on the **hover gesture state** too, or the button will change colour as it appears.

**If the green is abandoned, delete `hLYcAEbg2`** — it is an unused variant sitting on a component shared by 16 instances.

**Scope was Shak's explicit choice: this button only.** The alternative was repointing the **`Ora Blue`** colour style, which feeds `Button Blue to White`, `Button Blue to Outline` and `Button Blue - No Hover` — **9 blue button instances site-wide** (3 grid-card `View Case Study`, 2 `Global / Section CTA`, the `/careers` and `/404` buttons). That remains the one-line option whenever the template blue is finally retired.

**`#35790B` already exists as a colour style — named `Signal Orange`.** It is green, not orange; the name is template-era nonsense. The new variant uses the literal `#35790B` rather than that token, deliberately, so it does not depend on a mis-named style — but if the palette is ever cleaned up, point it at the token instead.

**HOW IT WAS ACTUALLY DONE — the `Ora Blue` colour style was repointed to `#35790B` (2026-10-07), because the scoped route is BLOCKED.** Two separate API walls, and the second is the one that matters:

1. A component instance's **`variant` control cannot be set** through `setAttributes` — silent failure, by id and by name (above).
2. **An API-created variant is not offered to instances at all.** `addVariant` genuinely works — `Button Alkimi Green - No Hover` (`hLYcAEbg2`) exists, renders correctly green on the component canvas, and the component's own variant row lists it 13th. But the **instance's Variant dropdown stops at the original 12**, before and after a full editor reload. A full attribute diff against a working sibling (`C1hBM5Wy4`) shows no difference beyond id, name, colour and canvas position, and the child-layer counts match at 4 — so nothing about the variant is malformed. The working theory is that the instance enum comes from the component's compiled module, which an API write does not recompile; it was not worth more of Shak's time to prove.

**So the one-token route was taken instead:** `colorStyle.setAttributes({ light: "rgba(53, 121, 11, 1)" })` on `Ora Blue`. Verified in a separate `exec`. This turns **9 button instances** green — the Home wide card, 3 grid-card `View Case Study`, 2 `Global / Section CTA`, and the `Button Blue to Outline` / `Button Blue - No Hover` uses on `/careers`. It is one attribute to revert.

**Two bits of debris left behind, both needing the editor:**

- **`hLYcAEbg2` (`Button Alkimi Green - No Hover`) is now redundant** and sits unused on a component shared by 16 instances, off to the right of the others on its canvas (~x 943). `removeNodes` does not reach inside a component, so it must be deleted by hand.
- **Two colour styles now hold the identical value `rgb(53, 121, 11)` under misleading names** — `Ora Blue` (which is green) and `Signal Orange` (which was always green). Worth renaming `Ora Blue` to something honest and merging or deleting `Signal Orange` during the stock-template cleanup, or a future audit will not know which is canonical.

**Note the button still turns WHITE on its own hover**, because the instance uses the `Button Blue to White` variant and only its resting fill came from the token. That is pre-existing behaviour, not something this change introduced.

**TIDY-UP, 2026-10-07 — two of three done, and one API claim above needs narrowing.**

**The colour styles are now honest.** `Ora Blue` renamed to **`Alkimi Green`** (it holds `rgb(53, 121, 11)`), and the duplicate **`Signal Orange` was DELETED** after a deep scan proved **0 references** project-wide. Five styles remain: `Black`, `White`, `Alkimi Green`, `Light Grey`, `Gray 20%`. `Alkimi Green`'s only four uses are all inside `Utilities / Primary Button` — three variant `backgroundColor`s plus one `border`.

**The usage scan is worth reusing — a background-only check is not enough.** Colour styles are also referenced from **`inlineTextStyle`**, which is where 54 of `White`'s uses live. The reliable method is to walk every node, then **recursively probe every attribute value that is an object** for an `id` matching a style id:

```js
const probe = (val, where, depth) => {
  if (!val || typeof val !== "object" || depth > 4) return
  if (typeof val.id === "string" && ids[val.id]) hits[ids[val.id]].push(where)
  for (const k in val) probe(val[k], where, depth + 1)
}
```

**NARROWING AN EARLIER CLAIM: it is specifically the `variant` control that cannot be written, not `controls` in general.** The note above says a component instance's control write fails silently; that is true of `variant` and **false** of the others. Writing the button's label control — `setAttributes({ controls: { XqpXZUGU6: "Projects" } })` — **worked first time and verified**. So treat `variant` as the known-bad one and verify any other control in a separate `exec` rather than assuming the whole surface is read-only.

**TWO `setAttributes` CALLS ON THE SAME NODE IN ONE `exec` — THE SECOND IS SILENTLY DROPPED (found 2026-10-07).** Matching the phone wide card ran, on one button node and in one script:

```js
await btn.setAttributes({ opacity: 1, position: "absolute", bottom: "0px", centerX: "50%", … })
await btn.setAttributes({ controls: { XqpXZUGU6: "Projects" } })   // <- never applied
```

The geometry landed; the label did **not**, and a fresh read still showed `View Case Study`. Re-issuing the identical control write **in its own `exec`** worked first time. The same pairing had worked earlier only because those were two *different* nodes.

**Rule: one `setAttributes` per node per `exec`.** If a node needs both geometry and controls changed, split it across calls — and verify, because this failure is silent and looks exactly like the `variant`-control problem, which it is not.

**Phone wide card now matches desktop** (`Home Project Single Wide - Mobile`, `tDcw55E8Q`): `Text Wrapper` hidden, label `Projects`, button `absolute / bottom:0 / centerX:50% / fit-content`. **Its `opacity` is `1`, deliberately unlike desktop's `0`** — desktop reveals on hover and a phone has no hover, so a `0` there would mean the button never appears at all. It sits where desktop's button lands at the end of its rise.

**One difference left on purpose:** phone uses button variant `Button Blue - No Hover` while desktop uses `Button Blue to White`. Both now resolve to `Alkimi Green` through the token; the difference is only that desktop's turns white when the *button itself* is hovered, which is meaningless on touch.

**STILL OUTSTANDING, and it genuinely cannot be scripted: deleting the orphan variant `hLYcAEbg2`.** Both `node.remove()` and `framer.removeNodes(["hLYcAEbg2"])` were called, **twice**, each reporting success; a fresh read still shows 13 children on `Utilities / Primary Button`. This is `removeNodes` not reaching inside a `ComponentNode`, now confirmed for component **variants** as well as nested layers, and confirmed not to be the documented "needs a second pass" case. **Delete it by hand**: open `Utilities / Primary Button`, select `Button Alkimi Green - No Hover` (it sits right of the others, ~x 943 on the component canvas), delete.

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

**The hover transition was finally MEASURED on 2026-10-05, and it is geometrically clean.** For months this was recorded as an unresolved "the cards look momentarily narrow on their inner edge while the hover settles", unreachable because no environment here could run the animation. Claude in Chrome with the tab **foregrounded** can: a `requestAnimationFrame` sampler captured **152 frames over 2508 ms at ~60 fps** on the published site, hovering the left card at scroll ~870.

| Property | Result across all 152 frames |
|---|---|
| Card heights | `761.11 / 761.11` — **never change at any point** |
| Gutter | **exactly 16** in every frame |
| Width sum | constant `1490` |
| Motion | **monotonic** `745 -> 894`, never exceeding 894 — no overshoot, confirming the overdamped spring |
| Duration | ~765 ms (motion begins ~227 ms after hover, settled by ~992 ms) |

**The sub-pixel theory is disproven.** The two inner edges always differ by exactly 16 CSS px, which is 24 device px at `devicePixelRatio` 1.5 — a whole number. So they hold an **identical sub-pixel phase at every instant of the animation** and blur together, symmetrically. There is never a frame where one edge is crisp and the other soft. The only deviation anywhere is a 0.04 px gutter wobble (15.96 vs 16.00) across a few settling frames near t≈1000 ms, which is a `getBoundingClientRect` rounding artifact, not a rendered difference.

Images were stationary in every frame sampled — left `15 / 894`, right `627 / 894` — confirming the outer-edge anchoring holds during motion, not just at the end states. That particular sample only covered the first ~70 ms of motion before the tab was switched away, so treat it as indicative rather than exhaustive.

**CAUSE CONFIRMED — it was the squared corner, and it is fixed. Shak verified by eye on 2026-10-05 after the publish: "hover looks right now, no narrowing."** Until that day the left `Product Card`'s radius collapsed `10px -> 0px` in `Home Projects Left Open` — a corner going square right against the gutter, at exactly the location reported and for exactly the duration reported. Restoring it to `10px` on both row components removed the symptom. **This item is closed.** Note what it actually was: never a sizing or sub-pixel problem at all, but a **paint** problem that no amount of measuring widths could have found — the geometry was correct throughout, which is why years of width-based investigation kept coming up empty. If anything similar is ever reported at a card edge again, check radius, overlay, shadow and opacity in the relevant *variant* first, and only then geometry.

**The right card's photo used to vanish on hover (resolved 2026-10-02).** Symptom: hover the Elements card and its photo ghosted out to near-nothing, leaving a diagonal striped pattern. Right card only, hover only, resting state fine. Cause: a single variant override —

```
Home Projects - Right Open -> Home Project Right -> Product Card
  -> Image Wrapper Right -> Image     Styles -> Opacity = 0.11
```

The left card's equivalent is `1`, which is why it was one-sided. Set it to `1` and the symptom is gone (confirmed by the user 2026-10-02).

**The diagonal stripes are Framer's placeholder tile, and they are always there.** A classless `<div>` sits at **child index 0 of both `Image Wrapper Left` and `Image Wrapper Right`**, carrying an inline-SVG background (`126x126` diagonal bars, `repeat`, `background-size: 64px auto`). The `Image` above it has `z-index: 1`, so the tile is normally invisible. **Seeing those stripes anywhere means the image above them went transparent — it is never a geometry or missing-asset problem.** Go straight to that layer's `Opacity` in the variant you are in.

**The hover `Video` on both cards is bound to a CMS field that does not exist.** The `Video` component's **Source -> URL** points at **`Thumbnail Video URL - Wide`**, and the **Home** collection has no such field (its fields are Status, Slug, Sorting Order, Sorting Next Project 1, Sorting Next Project 2, 5 Images on List View, Thumbnail Image - Wide, Title). Framer reports this as a purple **`Missing`** pill on the layer's `Visible` row. The right card's `Video` was set **Visible: No** on 2026-10-02 because there is no video content behind the binding; the left card's is untouched and still broken. If hover video is ever wanted, add the field to the Home collection and rebind rather than hiding the layer.


### Home hero — video and poster (changed 2026-10-06)

The hero is `Home / Hero Header`, and the thing you see is **three layers deep**, which is why a one-line change is never enough:

| What | Where | Note |
|---|---|---|
| The video | instance control **`xTAfQvz3w`** on `Home / Hero Header` | a plain URL string. Set it on the **Desktop** instance only — it propagates to Tablet and Phone automatically |
| The poster | `Container -> Video` -> control **`poster`** | what shows before the video plays, and the fallback if it fails or reduced-motion is on |
| The canvas/background fallback | `Container` -> `backgroundImage` | **this is what the Framer canvas renders**, because the canvas does not play video. A stale value here is why the canvas kept showing the old hero after the video was swapped |

**The component has three variants — `Image` (`h5u62WBaL`, used by Desktop + Tablet), `Image Active` (`LHWkCoKos`), `Mobile` (`Ga1eDgeVy`, used by Phone)** — and poster/background live **per variant**, so all three must be set. They were not previously uniform: `Image` and `Mobile` shared one background while `Image Active` had its own. As of 2026-10-06 all three use the same poster PNG; if `Image Active` was meant to differ, that divergence was deliberately collapsed and can be restored.

**Current values (2026-10-06):** video `d77bBFCntsmjWtY8JPzBcIZqc8.mp4` (3.7 MB), poster + background `gDcQ3ENSm2y233Kh79AcC5N6XD4.png`. The previous video was `IBiwWhp4RzTE9HPrBxW0cCnvoK8.mp4` (2.6 MB) with poster `lBa2FscGAOsSvNk8FF7SjmZHSnc.jpg` and background `Qzs3ssB5JVULhFptbf5LP7YzA.jpg`.

**Hero height per breakpoint, and the white sliver on phone (changed 2026-10-06).** `Section Hero` under `Main` was `100vh` on Desktop and Tablet but **`90vh` on Phone**, so the top of `Section Projects` (white) showed as a bright strip under the hero. On iOS it reads as a thin *sliver* rather than a full 10% because `vh` resolves against the **large** viewport (toolbars retracted), and it changes size as the toolbar hides and reveals on scroll.

**`svh` and `dvh` are NOT accepted — `setAttributes({ height: "100svh" })` is rejected SILENTLY.** The call returns without error and a fresh read still shows the old value. Both `100svh` and `100dvh` were tried on 2026-10-06 and both failed this way; `100vh` was accepted immediately. **Only classic `vh` works.** Treat any unit write as unverified until re-read in a separate `exec`.

**The custom-CSS workaround is a trap — do not take it.** `framer.setCustomCode()` exists (all four slots were empty as of 2026-10-06) and could inject real `100svh`, but **there is no per-page scope**: the only stable selector is `[data-framer-name="Section Hero"]`, and that element exists on `/about`, `/careers`, `/contact`, `/news` and `/news/:slug` too, where the Phone hero is **`fit-content`** or a fixed `409px`. Forcing those to viewport height would break five pages to fix one.

**So the fix was `100vh` plus raising the headline.** `100vh` alone is not safe here: the headline stack sat only **30px** from the hero's bottom edge, and iOS hides roughly the bottom 85-100px at load, which would have cut off "Measured lighting objects." until the visitor scrolled. The `Mobile` variant's `stack` padding was therefore changed from `0px 15px 30px 15px` to **`0px 15px 110px 15px`** (order is **t r b l**). Only the `Mobile` variant was touched — `Image` stays `50px` and `Image Active` stays `35px`, so Desktop and Tablet are unaffected.

**The 110px is an estimate of the iOS toolbar overlap and has not been measured on a real device.** Chrome viewport emulation could not be made to work here — `resize_window` resized the window but the page kept reporting `1536 x 855`, so phone layout cannot be verified from this environment at all. **Confirm on a real phone after publishing, and tune the 110px if the headline sits too high or is still clipped.**

**THE WHITE SLIVER UNDER THE PHONE HERO — SOLVED 2026-10-06 WITH A FIXED DARK BUFFER, NOT VIEWPORT MATH.**

**The idea that worked (Shak's):** stop trying to make the hero cover the fold, and instead make the zone *below* it dark and **taller than anything a browser can expose**. A fixed pixel buffer cannot be defeated by a viewport-unit quirk, a toolbar state or a safe area — unlike `100vh`/`101vh`, which are each a bet that some margin is enough.

**Final configuration (Phone only — Desktop and Tablet untouched):**

| Thing | Value | Why |
|---|---|---|
| `Section Hero` height | **`90vh`** | the original, deliberate 10% peek that signals scrollability. No longer needs to overflow the fold |
| `Section Hero` background | `#080200` **(Phone only — see the correction below)** | paints the 50px padding band at the bottom edge of the hero |
| `Section Projects` background | **`#080200`** | the peek is dark |
| **`Section Projects` top padding** | **`150px`** | **the load-bearing value, and the only tuning lever.** Calibrated on a real device: **`120px` left a thin strip on Safari**, **`180px` cleared it with room to spare**, so the true threshold is between them and `150px` is the midpoint. If white ever returns, raise it; nothing else depends on it. |
| `Home Projects - Mobile` variant | `background #fff` (inline), `padding: 15px` | the card buffer, supplied by the **component**, independent of the section |
| `Mobile` variant `stack` padding | `0px 15px 30px 15px` | the original headline composition |
| custom code `headEnd` | `<meta name="theme-color" content="#080200">` | colours the **phone browser's own toolbar**, not the page; global, and **settled — keep** (see below) |

**`Section Hero`'s background was NOT phone-only, and that shipped as a visible desktop regression (found and fixed 2026-10-06).** The table above previously listed it under "Phone only — Desktop and Tablet untouched". It was in fact written to the **Desktop (primary) breakpoint**, so it cascaded to all three, and the published build carried `background-color:#080200` on the **base** rule with the phone media query overriding only `height:90vh`.

**Why it was visible at all.** `Section Hero` is `padding: 0 0 50px 50px` with `overflow:hidden`, so a **50px band along the bottom and left** of the hero shows the section's own background rather than the video. Stock Ora fills that band with a gradient; ours had turned it black, which is what Shak spotted on desktop.

**The original value — established, not guessed.** The stock Ora template serves `.framer-h21q5l{background:linear-gradient(#545454 0%,#fff 5%)}` on the same layer (same class, same `id="home-hero"`, same padding), and **twelve nodes in our own project still carried exactly `0:rgb(84, 84, 84) → 0.05:rgb(255, 255, 255)`** — including a sibling `Section Hero` on another page across all three of its breakpoints. Two independent sources agreeing is what made this safe to restore rather than approximate.

**Restored by borrowing that live gradient** (the only way to set one — see the gradient note above). Final state:

| Breakpoint | `Section Hero` | `Section Projects` |
|---|---|---|
| Desktop | gradient `#545454 0%` → `#fff 5%` | `rgba(255,255,255,1)` |
| Tablet | gradient `#545454 0%` → `#fff 5%` | `rgba(255,255,255,1)` |
| **Phone** | **`#080200`** | **`#080200`** |

**THE TRAP, and it nearly reinstated the white sliver: writing the gradient to Desktop silently cascaded it to Phone.** The script deliberately skipped Phone, and Phone still came back carrying the grey→white gradient on the verification read — which would have put a near-white 50px band directly under the phone hero, exactly the defect the dark buffer exists to prevent. **A breakpoint you skip is not a breakpoint you preserved.** Phone had to be written explicitly afterwards. Always re-read **all three** breakpoints after any background or spacing write, not just the ones you touched.

**`Section Hero`'s phone `#080200` is load-bearing, not insurance.** It paints that 50px padding band. Do not clear it.

**`theme-color` is SETTLED — keep it (Shak, 2026-10-06). Do not propose removing it again.** It is the project's only custom code and it sits in `headEnd`, so it is **global**: verified live on `/`, `/about`, `/products`, `/contact`, `/news` and `/careers`. Framer's custom code has **no per-page scope**, so Home-only is not an option.

What it actually does is colour the **phone browser's own UI** — the strip holding the clock and address bar — not the page. **Desktop browsers ignore it entirely.** It originated as a white-sliver experiment (it helped Chrome; Safari ignores it for its bottom bar, which is why the dark buffer was needed), but it is kept now for a different and better reason:

**Removing it does not give a neutral result.** The bar reverts to the browser default, which on a light phone is a **white strip directly above Home's dark hero** — visually the same defect the dark buffer exists to remove. A dark bar over a white interior page reads as deliberate brand chrome; a white bar over the dark hero reads as a bug. The asymmetry is why "it is inconsistent across pages" is not a reason to drop it.

**Two layers do two different jobs — do not collapse them.** `Section Projects` is dark and supplies the peek colour; the **row component** carries its own white background and 15px padding and supplies the card frame. Earlier attempts made the section do both, which is why darkening it destroyed the card buffer.

**Framer emits per-element backgrounds INLINE, not as CSS rules.** The row component's white is `style="background-color:rgb(255, 255, 255)"` on the variant root. Grepping the published stylesheet for it finds nothing, and that false negative caused a wrong "the component paints no background" conclusion and an unnecessary rebuild scope. **Check inline `style=` attributes before concluding anything about a background.**

**Everything tried that did NOT work — do not repeat:** raising the hero height (`90→100→101vh`, shrank but never closed it); `svh`/`dvh` (silently rejected by Framer); custom CSS for `svh` (no per-page scope, would break five pages); `viewport-fit=cover` (no effect, removed); darkening `Section Projects` *without* the component buffer (killed the card frame); reverting to `90vh` while the dark zone was only 15px (white reappears below the padding).

**If the buffer ever needs tuning**, `Section Projects` top padding is the single value — raise it if any white returns, lower it if the gap above the cards looks too large. Nothing else depends on it.

**Softening the seam between the hero video and the black section below (Phone) — APPLIED 2026-10-06, by hand, verified on the canvas.** The hero already carried the mechanism: `Home / Hero Header` → variant → `Container` → **`Overlay`**, a 100%/100% absolute layer at `angle 180`. Its bottom stop only reached **39% black**, so the video stepped visibly into the solid `#080200` section below.

**What changed — one stop, now on ALL THREE variants:**

| Variant | Bottom stop (position `1`) | Used by |
|---|---|---|
| `Image` (`h5u62WBaL`) | **`rgb(8, 2, 0)`** (changed 2026-10-06, second pass) | Desktop + Tablet |
| `Image Active` (`LHWkCoKos`) | **`rgb(8, 2, 0)`** (same pass) | — |
| `Mobile` (`Ga1eDgeVy`) | **`rgb(8, 2, 0)`** = opaque `#080200` | Phone |

Angle stays `180` and the first stop stays `0.70 : rgba(255,255,255,0)` on all three.

**The desktop fade was applied as a SECOND pass, and the reasoning behind the first pass was wrong — do not restore it.** This file previously said *"Desktop and Tablet were deliberately left at 39%. There the hero sits above a white `Section Projects`, so fading to black would put a black band against white — worse than the hard edge it replaces."* That assumed the fade's purpose was to **blend the hero into the section below**. It is not. **The fade is a dark bottom vignette on the video itself**, which is why it works identically regardless of what colour follows it. Shak's words: *"this should be a fade from the bottom of the hero up to mimic what the phone is doing. not trying to transition into the white."*

**It also removed a conflict that only existed under the wrong reading.** Fading *to white* on desktop would have washed out the headline, which is `--framer-text-color: #fff` on every breakpoint and sits about a third of the way into the ramp. Fading to **dark** does the opposite — it deepens the scrim the white headline already relies on.

**Tablet comes along, unavoidably.** `Image` serves both Desktop and Tablet, so the variant cannot be scoped to one. There is no breakpoint-level override for a variant's gradient.

**Known consequence, accepted:** on Desktop and Tablet the hero's bottom edge is now solid `#080200` meeting the 50px white padding band and the white `Section Projects` below it — a harder boundary than the old 39% produced. That is inherent to a dark vignette over a light page and was raised before applying.

**Applied by borrowing the Mobile overlay as a donor** — the first use of the note below that this gradient became a donor once it existed. `framer.getNode("LXjJUpECH")` -> find the `Overlay` carrying a `backgroundGradient` on the `Mobile` variant -> assign that live object to the other two in the **same `exec`**. Verified in a separate `exec`: all three read `0.70 : rgba(255,255,255,0) -> 1.00 : rgb(8, 2, 0)` at `angle 180`.

**THERE WERE THREE layers named `Overlay` per variant, and two of them were STRAY WHITE FRAMES rendering on the live site (found 2026-10-06, hidden).** An earlier version of this note said there were two and treated the second as normal structure. That was wrong, and it meant a live visual defect sat in the published build unexamined.

| id | what it is |
|---|---|
| `…rSfcq_veC` | the real gradient overlay |
| `…uixrAYhm4` | **stray** — 200x150, `rgba(255,255,255,1)`, radius 10px, z-index 11, **zero children** |
| `…dod_6eCm9` | **stray** — identical |

Both sat inside `Container > Overlay`, were `visible: true`, and painted a **white rounded box over the top of the hero** on the published site. `200x150` is Framer's default size for a newly created frame, and the **stock Ora template contains no 200x150 rule at all**, so they are ours, not template residue.

**They are the strays from the failed `createFrameNode` attempts of 2026-10-05.** This file previously recorded that those were "confirmed not to have persisted, and the strays removed" — **that cleanup silently failed for exactly these two**, because they landed *inside a `ComponentNode`*, and `removeNodes` does not reach inside a component (see the canvas-editing limits). The cleanup appeared to succeed because the nodes it could see were gone.

**Hidden through the API, then DELETED BY HAND — both done 2026-10-06, and the component is now clean.** `setAttributes({ visible: false })` on all six (two frames x three variants) worked and verified `6/6` in a separate `exec`, which confirms again that **mutating** an existing component-internal node works where **deleting** one does not. Shak then removed them in the editor. Post-deletion read: **zero stray ids remain**, and each variant holds **exactly one** `Overlay` at `100% x 100%` with `childCount: 0`, gradients untouched (`Image` and `Image Active` at `rgba(0,0,0,0.39)`, `Mobile` at `rgb(8, 2, 0)`).

**Deleting at the `Image · Primary` variant cleared all three.** The greyed rows under `Image Active` and `Mobile` carry the inherit/override icon — they are the same two layers seen through those variants, not separate copies, so they must NOT be deleted again there.

**How to find them in the editor, since all three layers share the name `Overlay`:** filter the Layers panel for `Overlay` (the filtered tree is flat and does not reshuffle), then read the icons — the real gradient overlay has a **solid square icon, a lightning-bolt glyph and a purple label**, while a stray has a **double-square icon and a diamond glyph**. Size is the other tell: `100%/100%` versus `200 x 150`. `framer.getSelection()` is **not available in this permission scope**, so the selection cannot be confirmed through the API before a destructive click — the icons are the check.

**THE REASON THIS SURVIVED A DELIBERATE DEFECT SWEEP — a backgrounded tab produced a FALSE NEGATIVE.** A DOM probe for white elements overlapping the hero, run at five scroll positions on the published site, returned **nothing** while the Chrome tab was backgrounded. The same probe found the box immediately once Shak brought the tab to the front. The documented warning about hidden tabs was written as a source of false *positives* ("content stuck at `opacity: 0.001`, screenshots look blank"). **It cuts both ways: in a hidden tab an element whose appear animation never ran is simply absent from a paint-based sweep, so "I checked and it is clean" is not a safe conclusion.** Any sweep for an unexpected *visible* element must be run with the tab foregrounded, or confirmed by a human.

**It had to be done by hand, and that constraint still holds for the next one.** Gradients can only be set through the API by borrowing a live instance (see the gradient note above), and before this change the project held only four distinct gradients — the hero's grey→white and three overlay fades topping out at alpha 0.6. None reached opaque dark, so there was nothing to borrow. **This gradient is now itself a donor** and can be copied to other nodes through the API.

**The panel is not proof — verify from the canvas.** The edit was confirmed by reading `backgroundGradient.stops` back through the Agent CLI in a separate `exec`, not from the Fill panel, which in this project has displayed values it never stored.

**Published and verified live 2026-10-06.** The published home page carries exactly **two** hero overlay gradients, and Framer SSRs each breakpoint separately, so the scoping is directly checkable: the `ssr-variant` wrapper that is hidden on tablet and desktop renders `data-framer-name="Mobile"` with `rgb(8, 2, 0)`, while the wrapper hidden on phone renders `Image` with `rgba(0, 0, 0, 0.39)`. **That is the method for confirming any breakpoint-scoped change from the published HTML** — find the enclosing `class="ssr-variant hidden-…"` wrapper rather than guessing from document order; the three tokens map `72rtr7`=desktop, `1veez17`=tablet, `wpowcz`=phone, and a wrapper carries the two it is hidden on.

**CONFIRMED GOOD ON A HANDSET 2026-10-06 — but only after a hard refresh, and that detail matters.** The seam was first reported as still reading as a line *after* the publish. It was a **stale build cached on the phone**, not a defect: a reload cleared it and the fade was correct. **Before investigating any visual regression on a handset, hard-refresh or use a private tab.** This is a standing risk here because the entire feedback loop for this project is "publish, then look on a phone" — there is no publish-free preview that can be measured (see the automation gotchas).

**What stopped it becoming a wasted change is worth repeating as method.** The obvious response to "still reads as a line" was to lengthen the fade by moving the first stop to ~60%. Instead the published build was measured: `Section Hero` `90vh` with `background-color:#080200` and `padding:0 0 50px 50px`; `Overlay` absolute at `top:0, height:100%` spanning the full video; the gradient reaching `rgb(8, 2, 0)` at exactly 100%. On a 390x844 phone that is a ~213px fade landing on ~200px of flat `#080200` (50px hero padding + 150px section padding). **At the hero's bottom edge the overlay is fully opaque in precisely the colour of everything below it, so no colour step exists there to produce a line** — which meant the reported line had to be somewhere else, and lengthening the fade could not have helped. **When the arithmetic says a boundary is already seamless, do not tune it; find out where the user is actually looking.**

Tuning: move the first stop later (~80%) for a tighter fade that preserves more footage, or earlier (~60%) for a longer, softer blend. The headline sits 30px from the bottom and now lands on solid black rather than a 39% scrim, which slightly improves its legibility.

### /elements product photos were hidden layers, not a broken binding (fixed 2026-10-07)

Shak added **Product Photo** images to all 5 Elements CMS items and nothing appeared on the published page.

**The CMS was fine.** All five items carry a `Product Photo` (`w7KPkTziV`), all `draft: false`. **`Technical Drawing` (`f5JSD5nVj`) is empty on every item.**

**The page was fine too — except the image layers were switched off.** Row structure:

```
Elements Row > Media > Photo Placeholder          visible: true    (empty 1fr x 100px box)
                     > Photo Placeholder > Product Photo       visible: FALSE
             > Media > Drawing Placeholder        visible: true
                     > Drawing Placeholder > Technical Drawing visible: FALSE
```

**3 rows x 3 breakpoints = 9 `Product Photo` layers, every one `visible: false`.** Set to `true`; `Technical Drawing` deliberately left hidden because its field is empty on all five items, so unhiding it would render nothing.

**The diagnosis that saved time — count `<img>` tags on the published page.** The page had the asset URLs (4 occurrences each) **and** the rendered titles, which looks like a working binding. But it had **zero `<img>` tags and zero `background-image` references to `framerusercontent`**. Asset URLs alone prove nothing: **Framer ships the whole CMS payload as serialised JSON at the end of the page whether or not anything renders it.** So:

- asset URL present + `<img>` present -> rendering
- asset URL present + **no** `<img>` -> the data reached the page and a *layer* is the problem (hidden, unbound, or zero-size)
- asset URL absent -> a CMS or filter problem

That distinction is the quick way to tell a binding fault from a layer fault, and it applies to any Framer CMS page.

**Making those photos bigger — the obvious levers are INERT, and knowing why saves a wasted publish (2026-10-07).** `Photo Placeholder` carries `padding: 12px` and `place-content: flex-start flex-end; align-items: flex-start`, which looks like the thing to change. **Neither touches the image.** `Product Photo` is `position: absolute; inset: 0`, and an absolutely-positioned child resolves `inset` against its ancestor's **padding box** — so it already spans the full square, padding included, and `place-content`/`align-items` only govern *flow* children. The `<img>` inside is `width/height:100%; object-fit:cover; object-position:center`.

**So the only two real levers are:**

| Want | Change |
|---|---|
| product reads larger, card unchanged | scale `Product Photo` past 100% and let `Photo Placeholder`'s `overflow: clip` crop the margins |
| larger without cropping | make the box itself bigger — `Media` is `2fr` of `Elements Row`, split between `Photo Placeholder` and `Drawing Placeholder` (each `1fr`, `aspect-ratio: 1`, `12px` gap) |

Applied the first: all **9** `Product Photo` layers (3 rows x 3 breakpoints) set to **`120%` / `120%` with `centerX: 50%`, `centerY: 50%`**. These are product renders on white, so the 10% cropped from each edge is margin, not product — **but it is a crop, so check nothing clips at the extremes before trusting it.** Raise or lower the single `SCALE` value to tune.
**Settled at `140%` on all nine (2026-10-07).** Tried 120, then 140, then LED-only at 100 for a side-by-side, then back to a uniform 140.

**PER-ITEM SCALING IS NOT POSSIBLE HERE — do not promise it.** The three `Product Photo` layers are **one per Collection List**, not one per item:

```
Connector Section > Connector List > … > Product Photo    ->  Liga T, Liga W
Driver Section    > Driver List    > … > Product Photo    ->  Driver 5-1
LED Section       > LED List       > … > Product Photo    ->  Rima 5 AND Rima 10
```

Each list renders every one of its items from that single layer template, so a scale change hits every row in the category. Framer will not bind a layer's **width** to a CMS number the way it binds text, images, links or visibility, so there is no per-row override either.

**Shak asked for Rima 10 to appear larger than Rima 5. That needs ARTWORK, not layout** — and two blockers stack: the two items share the **same asset** (`kvgBkNzGbs9xlMnzquAabMJlOk.png`), so even independent scaling would only enlarge an identical picture; and they share the one layer. The right fix is a per-item render with the product sized to relative scale inside a consistent canvas, which also closes the content gap of two different products showing one photo.

**The layout escape hatch exists but was advised against:** splitting a section into two Collection Lists filtered to one item each, with their own photo scales. It doubles the section markup, needs the heading and count handled, and breaks again as soon as a third product joins that category.

**Real dimensions for reference** (Imperial, from the CMS; Metric is empty on every item): Rima 5 `0.20 × 0.25″`, Rima 10 `0.31 × 0.31″` — so Rima 5 is about **65%** of Rima 10's width, not half. Liga T `0.35 × 0.38″`, Liga W `0.44 × 0.52″`, Driver 5-1 `0.44 × 0.50″`. True relative scale across the set would render Rima 5 at under half its neighbours in a 100px box, which is why filling each card is the defensible default while the dimensions sit in the spec columns alongside.

**THE TWO PAGES USE DIFFERENT VERTICAL RULES, DELIBERATELY — SETTLED BY SHAK 2026-10-08. DO NOT "FIX" IT.**

| | `/products` (Fixtures) | `/elements` (Elements) |
|---|---|---|
| vertical | **centred**, v-centres at 50%, bottoms spread `61.8-72.9%` | **baseline**, bottoms all at `73.1%` |
| horizontal | **right-aligned** — end caps at `86.6%`, bleeding off the left | **centred** at `50%` |

**Only the vertical is a genuine rule conflict.** The horizontal difference follows from the artwork: the fixture renders have no left edge to centre on (every one bleeds off `x = 0`), so end-cap alignment is the only coherent treatment for a continuous run, while a contained object centres. That is a consequence, not a choice, and does not need reconciling.

**The vertical was raised with Shak and he chose to leave it**, on the grounds that the two pages are rarely seen together. The alternative offered was baseline on both — re-rendering the 11 fixtures to sit at `73%`, which was checked and would clip nothing (the tallest, `Prisma Link 1` at 44% of canvas, would sit top `29%` / bottom `73%`). **The argument FOR baseline, recorded so it can be weighed again if the pages ever converge:** both sets are products resting on a surface with ground shadows, a shared ground line is the catalogue convention and makes sizes comparable, and both pages use the identical square `Photo Placeholder` so `73%` means the same visual level on each. **The cost of changing it later is one render pass plus a canvas drop — it does not get harder with time**, so there is no urgency, but any new fixtures artwork should follow the centred rule to stay internally consistent.

**Where `73%` came from:** three of the five Elements renders (`Rima 10`, `Liga T`, `Liga W`) already shared a ground plane at exactly that height, and it coincides with where the resting fixtures land (`Flow Spine 72.9`, `Prisma Link 1 72.5`, `Flow Straight 72.4`). It is the artwork's own ground line, not an invented number.

**`/elements` PHOTOS REPLACED WITH JPEG, AND RIMA 5 / RIMA 10 FINALLY HAVE DISTINCT IMAGES (2026-10-08).** All five Elements `Product Photo` fields now point at `.jpg`, served unquantised. **The long-standing content gap is closed** — `Rima 5` and `Rima 10` had been sharing one asset (`kvgBkNzGbs9…png`), which is why "make Rima 10 look bigger" was previously impossible at any layout setting.

**NO GEOMETRY PIPELINE WAS APPLIED, DELIBERATELY — and applying one would have destroyed the point.** Shak's `Rima 5` file is named *"Rimi COB coil - 75 percent - 5mm"* and measures **0.753x** the `Rima 10` render; the filename is literal. **He has solved the relative-scale problem in the artwork**, which is the only place it can be solved (one `Product Photo` layer serves every row of a Collection List). Note he chose **75%** over the true dimensional ratio of **64.5%** (`0.20in` vs `0.31in`) — a deliberate softening so the smaller part does not read as insignificant. **Any per-image rescale here silently undoes that decision.**

**The framing needed nothing either.** Measured against the outgoing assets, the new renders are the same compositions re-exported: `Liga W 49.0% x 24.6%` against `49.6% x 24.6%`, `Liga T 48.2 x 26.8` against `49.0 x 26.8`, `Driver 47.2 x 17.4` against `47.4 x 17.4`, `Rima 10` identical at `32.4 x 32.6`. So the existing layer scales stay correct — `140%` on the Connector and LED lists, `160%` on the Driver — and all five products sit centred (50-52%), unlike the fixtures which bleed off the left.

**Identification was done by shape, not by filename.** The files arrive as `Revision Round B-33/B-34/D-1/D-2` plus the COB coil, which say nothing about which product they are. The 24x24 ink-grid matcher gave a clean bijection with wide margins (`Liga W 1.62` against `8.25`, `Liga T 2.29` against `8.27`, `Rima 10 0.36`, `Driver 0.50`), and the two Liga assignments were independently confirmed by height footprint matching to a tenth of a percent. **An earlier batch of five (`B-20/B-37/B-38/D-1/D-2`) scored 11-12 across the board and was correctly rejected as unidentifiable; Shak replaced it.** Trust the matcher's refusal.

**A FRESH SESSION CAN ALSO SERVE A STALE DOCUMENT — the recorded trap is wider than written.** This file says a *long-running* `exec` session can go stale. In fact a **brand-new session created immediately after a write** returned all five pre-write values, while a second new session moments later returned the correct post-write state. **So "open a new session" is not sufficient on its own: re-read until two reads agree, or treat a single post-write verification as provisional.**

**`Technical Drawing` is still not ready to unhide: only `Liga T` has one** (`FryzpZaIs…png`), the other four are empty. Unhiding the nine layers now would render one drawing beside four blank boxes. **Note that drawing is the `3504x2478` 8-colour PNG *with alpha* flagged in the PNG audit** — and it is the awkward case, since JPEG cannot carry its transparency while PNG guarantees it gets quantised.

### Fixtures product renders — aligning the right edges (2026-10-08)

Shak asked for the `/products` photos to have their right edges align, be centred, and scale to 140%. **Two of those three are impossible in layout, and the third makes the first worse.**

**The boxes already align.** All 11 `Photo Placeholder` elements share ONE published rule — `aspect-ratio: 1; width: 1px` (flex-grow); `padding: 12px; overflow: clip` — and every `Product Photo` is `position: absolute; inset: 0`. Same column, same width, so their right edges are already on one vertical line. **The raggedness is entirely inside the artwork.**

**Measured, all 11 at 2000x2000:** every product's left edge is at **0.0%** (they all bleed off the left) and the right edge ranges **55.6% to 72.5%** — a 16.8-point spread. Vertical centres also vary, **47.5% to 57.0%**, and the backgrounds are four different near-whites (`247,246,242` / `248,247,243` / `248,246,242` / `247,246,243`).

**Scaling the card to 140% magnifies the misalignment by 1.4x** — at that zoom the card shows the middle 71% of each render, so right edges would land `57.8% .. 81.5%` instead of `55.6% .. 72.5%`. Anything above 100% widens the spread. **If alignment matters, 100% is the best the layout can do.**

**Shak's call: scale each product to a common length** (the alternative was shifting, which would have broken the uniform left bleed). This trades away relative product size — the same property he wanted *more* of on the Rima rows, so the two pages now take opposite positions deliberately.

**Method, reusable for any future batch:**

1. Decode each PNG (zlib inflate + un-filter + palette lookup) and take a per-column ink profile against the corner background sample to get the product bbox.
2. Target the **longest** product's right edge (`1450px`, Flow 20) so nothing has to shrink; scale factor `s = 1450 / x1` per image, ranging `1.000` to `1.304`.
3. Anchor at `x = 0` to preserve the left bleed, and offset vertically by `vc * (1 - s)` so each product's vertical centre stays where it was.
4. ffmpeg, **forced through an RGB pipeline** — `format=rgb24` on both inputs, on the overlay, and `-pix_fmt rgb24` out. Without this ffmpeg round-trips through YUV and shifts every background 1-2 levels (`247,246,242` became `246,244,240`). Harmless to the eye, trivially avoidable, and the kind of thing that compounds.
5. Pad with **each image's own** background colour, not a shared one, since all four near-whites differ.

**Result: right edges at `72.5% .. 72.8%`** — 0.3 points of spread, down from 16.8, with backgrounds byte-matching the originals. Files at `C:\Users\shaki\alkimi-renders\fixtures-aligned\`.

**UPLOADING THEM BACK CANNOT BE AUTOMATED FROM HERE — this is the hard limit.** `framer.uploadImage` takes `AssetInput = string | File | BytesData`, and all three routes fail from an `exec`:

- **`BytesData`** — a `Uint8Array` built inside the `exec` is rejected with *"Asset input must be a URL string, File, or { bytes: Uint8Array, mimeType: string }"*. The shape is right; the typed array does not survive marshalling across the relay.
- **`File`** — same marshalling problem, and there is no file system in the `exec` context anyway.
- **URL string** — accepted as a shape (`{ image: "https://…" }`, and note the bare string is NOT accepted), but Framer fetches it **server-side** and rejects anything non-public: *"URL … is not an external URL"*. A localhost server does not work.

So new image bytes only enter the project **by hand**. The two routes that do work: assign in the CMS cell directly, or **drop the files on a canvas** and read `backgroundImage.url` off the dropped node — the latter is the one already proven twice on this project, and it lets the CMS rewiring be scripted.

**DELIVERED INTO FRAMER 2026-10-08.** Shak dropped the 11 files on the canvas; each dropped node's `backgroundImage.url` was read and written to the matching Fixtures item's `Product Photo`, **matching node name to CMS title inside the script** (hyphens normalised away) rather than by a hand-written table — the mapping is the part most likely to go wrong silently, so it should never be transcribed. Verified in a fresh session: **11/11 items on the expected asset, 11 distinct assets, 0 drafts**, `Technical Drawing` untouched. Then verified the *hosted* files rather than trusting the upload: four assets were pulled back off `framerusercontent.com` and re-measured, giving right edges `72.5 / 72.5 / 73.0 / 72.5` — identical to the local originals. **Measuring the CDN copy is the check that actually proves delivery**, since it tests the asset the site will serve rather than the one on disk.

**The `/products` photos were ALSO hidden — the same defect as `/elements`, found only because this work touched them.** All **9** `Product Photo` layers (3 Collection Lists x 3 breakpoints: `Flex List`, `Profile List`, `Optic List`, each through `Profile Row > Media > Photo Placeholder`) were `visible: false`. Nobody had reported it; `/elements` was fixed on 2026-10-07 and this page was never checked. **If a Framer page renders CMS text but no product imagery, check the layer's `visible` before anything else — this template ships these layers switched off.**

**NEW SILENT-FAILURE MODE, and it is a good one: a node pinned on all four edges SILENTLY REFUSES `width`/`height`.** Setting `{ visible: true, width: "140%", height: "140%", centerX: "50%", centerY: "50%" }` on these nodes **applied `visible` and dropped everything else** — no error, and a fresh read showed `width: null`. Retrying the size attributes alone in their own `exec` failed the same way, which ruled out the one-write-per-node rule.

The cause only showed up in a **full attribute dump compared against a node where the same write had worked**:

| | `/elements` (write works) | `/products` (write dropped) |
|---|---|---|
| `top/right/bottom/left` | all `null` | all **`0px`** |
| `centerX/centerY` | `50%` / `50%` | `null` |
| `width/height` | `140%` / `140%` | `null` |

A node pinned on opposite edges has its size **derived** from the insets, so `width` is not merely unset but unsettable. **Clearing the four insets to `null` in the SAME `setAttributes` call makes it store first time:**

```js
await node.setAttributes({ top: null, right: null, bottom: null, left: null,
                           centerX: "50%", centerY: "50%", width: "140%", height: "140%" })
```

This is the same family as the already-recorded `centerX` needing `left`/`right` cleared in one write — **generalised: positioning attributes are a mode, not a set of independent fields, and writing the new mode's fields without clearing the old mode's is a silent no-op.** The diagnostic that found it is worth repeating: when a write vanishes, dump **every** attribute of the failing node beside one where the identical write succeeded, instead of re-trying variations of the write.

**State now: all 9 at `140%` with `centerX/centerY 50%` and insets cleared, verified in a fresh session.** `140%` is safe here only *because* the sources were aligned first — a centre crop at that zoom lands every right edge at ~81.5%, still in one line. **Revert to `100%` and the alignment survives too; any scale does, now that the artwork agrees.**

**VERTICAL CENTRING — a SECOND pass, 2026-10-08, because right-edge alignment left the vertical ragged.** Shak asked how the images lined up vertically; the honest answer was that they did not. The first pass deliberately *preserved* each product's own vertical centre (the brief was right edges), which left centres spanning **47.6% to 57.2% — 9.6 points**, and not as random scatter: the larger products (Vena, Vena Corner, Flow Spine, Flow Straight) sat near 48% and the smaller ones near 56%, so it read as two groups at different heights. **At the 140% card scale that spread is magnified 1.4x, i.e. about 13% of card height.**

Fixed by shifting each product so its vertical centre lands at exactly 50%, horizontal untouched. Shifts ran **-143 to +49 px**; nothing clipped (checked before rendering — compute `newTop`/`newBot` and refuse if either leaves the canvas). Result: **v-centre spread 0.0, every image at 50.0%**, right edges still `72.4 .. 72.8%`. Tops and bottoms still span 8.6 points, which is inherent — the products are genuinely different heights, and centring aligns centres, not edges.

**THE FFMPEG COLOUR TRAP BIT AGAIN, IN A NEW PLACE — and the earlier fix was incomplete.** The recorded rule was "force an RGB pipeline with `format=rgb24`". That is necessary and **not sufficient**: a `-f lavfi -i color=c=#f7f6f2` source **generates its frame through YUV before any filter runs**, so `[0:v]format=rgb24` converts an already-degraded canvas. The pad strip came out `246,244,240` against the source's `247,246,242`.

**It was only visible because the sample points were chosen to catch it.** Comparing all four corners plus a mid-edge point against the input showed the shift **only on the padded side** — Vena moved down 19px and its *top* corners differed while its *bottom* corners were exact. **A single-corner check would have passed and shipped the shift.** Sample every corner, and know which ones the operation actually touched.

**The fix is to never introduce a second input at all** — do the shift with `pad` + `crop` on the image itself, where the fill colour is written directly into the existing rgb24 buffer:

```bash
# move DOWN by dy
ffmpeg -i in.png -vf "format=rgb24,pad=${W}:$((H+dy)):0:${dy}:color=0xF7F6F2,crop=${W}:${H}:0:0" \
  -pix_fmt rgb24 -frames:v 1 out.png
# move UP by |dy|
ffmpeg -i in.png -vf "format=rgb24,pad=${W}:$((H-dy)):0:0:color=0xF7F6F2,crop=${W}:${H}:0:${-dy}" \
  -pix_fmt rgb24 -frames:v 1 out.png
```

Verified byte-identical on all four corners of all 11. **The general rule: every extra input is a colour-management risk; prefer a single-input filter chain over compositing whenever the operation allows it.**

**One `DIFFER` in the final check was CORRECT and worth noting as a reading lesson.** Flow-20's bottom-right corner went `236,236,236` -> `248,247,243`. That is not a colour shift — it is the product's shadow leaving the corner because that image moved up 111px. **A corner-colour check is only a colour check where the corner holds background in both versions**; where content moved through it, a difference is the expected result. Its other three corners matched exactly, which is what settled it.

**THIRD PASS — the artwork was re-cropped and the card scale came back to 100% (2026-10-08).** Shak asked why Flow 20's curve was cut and which route gave the best fidelity.

**First, the finding that closes the question: the complete curve is NOT in the asset.** An ASCII deviation map of the left edge shows product body (`@`) sitting in column 0 across `y 796..876`, and the **untouched original from Framer does the same**, so the strip was composed running off the frame. **No scale, pad or crop can recover it — only a re-render.** Do not spend time trying.

**The decisive measurement was the rendered card size, and it reframed the whole question.** `Photo Placeholder` measures **391.3 CSS px -> 587 device px** at `devicePixelRatio` 1.5 (read from the live `/products` DOM). Against a 2000px source that is **2.4x oversampled at 140%, 3.4x at 100%**. **So sharpness cannot separate the options** — every candidate is far above display resolution, including the items the first pass upscaled by up to `1.30x`. "Best fidelity" therefore means *how completely and how large the product reads*, not how sharp it is. **Measure the rendered box before reasoning about image quality in this project; the intuition that a bigger source is a better source is wrong here by a factor of two to three.**

**What the 140% zoom was costing**, measured as ink falling outside the crop window: `Flow Spine 20.2%`, `Vena Round Mini 18.5%`, `Flow Straight 17.9%`, `Vena 17.7%`, `Prisma Link 1 15.3%`, `Flow 20 11.3%`, `Prisma Multiplier 7.8%`. **Flow 20 was among the least affected** — the zoom was fighting the whole set, not one image.

**The route taken: crop the canvas instead of zooming the card.** Because all 11 had been normalised to the same geometry — left bleed at `x 0`, right edge at `1450`, vertical centre at `1000` — **a single identical crop serves every image**, which is what guarantees they stay aligned:

```
crop=1600:1600:0:200          # from the 2000x2000 centred set
```

Right edge lands at **90.6%** (was 72.5%), vertical centres stay at 50%, and the tightest vertical clearance is **432px** (`Prisma Link 1`, the tallest). Card scale then set **`140%` -> `100%`** on all 9 layers, so nothing is cropped at render time.

| | 140% on 2000px | 100% on 1600px |
|---|---|---|
| product on screen | 478 device px, **clipped** | **532 device px, whole** |
| right edges | 72.5% | **90.6%** |
| resampling | — | **none** |

**A pure crop is lossless, and that was verified rather than assumed** — 52,441 sampled pixels per image compared against the source at the crop offset, **bit-identical** on every one tested. This is why route 2 strictly dominated "just set the card back to 100%": same pixels, nothing cut, and the product reads *larger than the 140% zoom made it*.

**Verified end to end:** 11/11 CMS items on the expected asset, 11 distinct, all 9 layers at `visible / 100% / centerY 50%` with insets cleared, and four assets pulled back off `framerusercontent.com` confirming `1600x1600`, right edges `90.5–90.8%`, v-centres `50.0–50.1%`.

**The one tuning knob is the canvas size.** `1600` leaves a 9.4% right margin; `1500` would put the right edge at 96.7% and the product at ~568 device px but only 3.3% of breathing room. Everything else follows from it.

**Still outstanding and only fixable with new artwork:** the left bleed on the long strip products, and `Rima 5` / `Rima 10` sharing one asset on `/elements`. Both are the same class of problem — **artwork, not layout** — and a re-render would also retire the up-to-`1.30x` interpolation the alignment pass introduced.

**FOURTH PASS — shifted 4% left, which is only possible by ADDING canvas (2026-10-08).** Shak asked to move the images slightly left in unison without cutting Flow 20's curve. **Those two are in direct conflict under the obvious reading:** the products sit *at* `x 0` and bleed off it, so there is no slack — moving the image left cuts product, Flow 20 first. **The only non-cutting leftward move is to add margin on the RIGHT**, which shifts every product left *relative to its card* while keeping their right edges aligned with each other.

The cost is linear and worth knowing: **~6 device px of product width per 1% of leftward shift**, because the same 587px card then shows a wider canvas. Applied `1600 -> 1674` (`pad=1674:1674:0:37`), putting right edges at **86.6%** (from 90.6%) and the product at **508 device px** (from 532). Card scale stays at `100%` — raising it would crop the new margin straight back off.

**Fidelity did not discriminate between the candidate shifts, and that was the answer to Shak's question.** 2% / 4% / 6% are all pure padding — no scaling, no resampling — and land at `2.79x / 2.85x / 2.92x` oversampling against the source, with even the most-upscaled item at `2.1-2.2x`. **Nothing in that range is visible as softness**, so the choice was aesthetic, not technical. The only option that would have cost anything was cutting, which destroys product permanently. **When a trade-off looks like quality vs. appearance, check whether the quality axis is actually in play before treating it as a trade-off.**

Verified: content **bit-identical** to the pre-pad set at the pad offset, **pad colour exact** against each image's own background, 11/11 CMS items on the expected asset, and four pulled off the CDN confirming `1674x1674` with right edges `86.6-86.7%` and v-centres `50.0-50.1%`.

**FIFTH PASS — background normalisation, and the discovery that FRAMER RE-ENCODES EVERY UPLOAD (2026-10-08).** `Photo Placeholder` and `Drawing Placeholder` carry their own fill — `background-color:#f7f6f2; border-radius:10px; padding:12px; aspect-ratio:1; overflow:clip` — shared by six classes. **On the photo card the fill is never seen** (the image resolves `inset`/100% against the padding box, so it covers the square edge to edge and is clipped to the same radius), **but `Drawing Placeholder` is pure fill**, because `Technical Drawing` is empty on all 11 items and hidden. So every row shows a photo beside a bare `#f7f6f2` square, which makes the fill a reference colour the artwork is judged against.

The 11 sources carried four different near-whites (`#f7f6f2` x5, `#f8f7f3` x3, `#f8f6f2` x2, `#f7f6f3` x1). Normalised to `#f7f6f2` by a **uniform per-channel offset** (`lutrgb`), not by repainting background pixels — a global shift moves gradients, shadow falloff and product tone together, where a selective recolour would band at the soft edges. Verified: all 4 corners of all 11 exactly `247,246,242`, darkest pixel in the set `22` so nothing clipped, geometry untouched.

**THE UPLOAD IS RE-ENCODED, BUT THE COLOUR SURVIVES — AN EARLIER VERSION OF THIS NOTE CLAIMED OTHERWISE AND WAS WRONG.** Framer does re-encode (the `.png` URL returns 65 KB against a 663 KB source) and **the `.png` URL is genuinely an 8-colour DITHERED palette image** — read straight from its `PLTE` chunk, so that part is not in doubt. **Do not measure colour from `framerusercontent.com/images/<id>.png`; it is not the file you uploaded.**

**But the browser paints the SOURCE value.** Sampled from a screenshot of the published page: the photo card reads **`247,246,242`** — exactly `#f7f6f2`, the normalised source — across 13 distinct values, i.e. real image noise averaging to the right colour. **The normalisation carried through end to end.**

**THE ERROR, AND IT REACHED THE LIVE SITE.** This file briefly recorded that the served WebP paints `246,244,240`, that Framer's encoder pulls near-white through YUV by `-1,-2,-2`, and therefore that "no source value can match a CSS fill" — on the strength of which all 36 placeholders were repainted `#f7f6f2 -> #f6f4f0` and published. **That `-1,-2,-2` was introduced by `ffmpeg`'s own WebP -> RGB decode, not by Framer.** The asset was fetched with `Accept: image/webp` and converted with `ffmpeg` before sampling, and that conversion step applied the shift. **The change therefore CREATED the mismatch it was meant to remove**, leaving the empty `Drawing Placeholder` a flat `#f6f4f0` against photo cards still painting `#f7f6f2`. Reverted; all 36 are `#f7f6f2` again, verified in a fresh session.

**This is the THIRD time in one session that ffmpeg's colour handling produced a false reading** — after the `lavfi color` source and the YUV round-trip on `overlay`. The first two were caught before shipping; this one was not, because it was treated as a *measurement* rather than a transformation. **Any decode or format conversion is a transformation, and must not sit between you and a colour you intend to trust.**

**The method that is actually reliable: sample a screenshot of the rendered page.** It captures the framebuffer after the browser's own decode, so it has no extra conversion in the path — and Shak supplying one is what exposed this. A re-decoded asset answers "what does my decoder think this file contains", which is a different question from "what does the visitor see".
**## THE HEADING BELOW IS WRONG. FRAMER DOES NOT QUANTISE ON INGEST — CORRECTED 2026-10-09. READ THIS FIRST.**

**The stored master is full fidelity. The indexed-colour PNG is a DELIVERY DERIVATIVE, generated only when the client refuses WebP.** Everything below about palettes, dither density and the JPEG migration was built on a measurement artifact of my own fetch method.

**The proof, and it is not interpretable any other way.** Same asset, same URL, **full size, no `scale-down-to`, so nothing resamples** — only the `Accept` header differs:

| requested as | tones | dither blocks |
|---|---|---|
| `Accept: image/png` | **69** | **9.7%** |
| `Accept: image/webp` + `?lossless=1` | **324,472** | **0%** |

**A lossless encode cannot invent 324,000 tones from a 69-colour source, and cannot remove a dither pattern.** Confirmed on a second asset (Aesop thumbnail: `256` tones / `16.5%` dither through the PNG path, `899,070` tones / `0.5%` through lossless WebP).

**And real visitors get the WebP.** Verified end to end rather than assumed: the page's own `<img>` transfers byte-match the WebP response exactly (`5,327,360` and `2,292,228`) and not the PNG response (`2,447,631` / `1,035,717`).

**THE MISTAKE WAS THE `Accept` HEADER, AND IT IS THE SAME CIRCULARITY THIS FILE ALREADY WARNS ABOUT.** `curl` sends `Accept: */*`, which this CDN does **not** treat as WebP-capable, so it falls back to the quantised PNG. I fetched "with no parameters", got that derivative, and called it the stored master — then wrote a prescription ("read the IHDR colour type of the asset Framer serves with no query parameters") that bakes the error in permanently. The file already says *"untouched must mean untouched by the whole pipeline, not merely untouched by me"*; this is the same error pointing the other way. **Always send `Accept: image/webp,*/*` when asking what Framer stores, or measure in the browser, which sends it for you.**

**What follows from this:**

- **The site was never serving 7-colour images to anyone.** The PNG audit's severity ranking measured a derivative that no real browser requests.
- **The "upload JPEG for anything photographic" rule is unnecessary — drop it.** It is also very slightly counterproductive: a JPEG master bakes in one generation of loss a PNG master does not. **No harm was done in practice** (at the rendered size the difference is far below visibility) and it is **not worth reverting**, but do not carry the rule forward and do not re-flag PNG as dangerous.
- **The geometry pipeline is untouched by this.** Alignment, cropping, centring and the end-cap work were all real and remain correct — only the format rationale was wrong.
- **Shak's original "strange discoloration near the end cap" is UNEXPLAINED AGAIN.** It was not PNG quantisation, because that only ever existed in my own fetches. If it is still visible, it needs a fresh diagnosis — start by sampling a screenshot of the rendered page, not an asset fetched by any means.

### The Resolution dropdown (Auto / Auto lossless / Small / Medium / Large / Full) — use Auto

Selecting an image in the editor exposes **Resolution**. It is a **delivery** setting and it is **not readable or settable through the Agent API** — no attribute on the node, nothing in `uploadImage`, and the `ImageAsset` does not even serialise across the relay. Editor-only.

It controls the emitted `srcset`: `Auto` gives `scale-down-to=512 / 1024 / full`, and **`Auto (lossless)` adds `&lossless=1`** to every candidate. `Small`/`Medium`/`Large`/`Full` cap the pixel size instead.

**Measured, on a real product render at the 1024w candidate the browser actually picks:**

| | bytes | tones in the product band |
|---|---|---|
| `Auto` (lossy WebP) | **8,786** | 302 |
| `Auto (lossless)` | **47,434** | 1,313 |

Difference between the two images: **mean 0.153 levels**, max `10`, with only **0.86%** of channel samples differing by more than 2 and **0.03%** by more than 5. The card then downscales `1024 -> 587` device px, averaging roughly 3:1, which erases what little is there. **5.4x the bytes for a difference that cannot be seen.**

**So: `Auto`.** Reach for `Auto (lossless)` only for flat-colour graphics, screenshots, text rendered into an image or hard-edged UI art, where lossy WebP ringing shows. Never for photographs or renders. **`Full` is also the wrong instinct** — the product cards render at 587 device px against 1674px sources, already ~2.8x oversampled, so capping higher buys nothing.

**LOSSLESS IS CURRENTLY ON ACROSS THE SITE AND IT DOMINATES PAGE WEIGHT (measured 2026-10-09).** Count of `lossless=1` in the published HTML: **Home 31, `/projects-grid` 40, `/projects-list` 132, `/news` 20**; `/products`, `/elements`, `/about`, `/contact`, `/careers` are clean at 0.

| page | image weight | of which lossless | switching to Auto saves |
|---|---|---|---|
| Home | **7,658 KB** | 7,441 KB in **2 images** | **6,266 KB (82%)** |
| `/projects-list` | 2,075 KB | 1,761 KB in 9 images | **1,230 KB (59%)** |

**Home's two offenders are the Mush Energy (5,203 KB) and Aesop (2,239 KB) article thumbnails** — i.e. **97% of the home page's image weight is two stock-template thumbnails already queued for deletion**, so that one resolves itself with the Ora cleanup. `/projects-list` and `/projects-grid` are real project photography that stays, and those are worth switching to `Auto` by hand.

### FRAMER QUANTISES EVERY UPLOADED PNG TO A TINY PALETTE — upload product renders as JPEG (found 2026-10-08)

Shak reported "strange discoloration near the end cap" and said his source images do not have it. **He was right, and the first diagnosis here was wrong.** Boosting the cap face of the asset already in Framer showed scattered bright dots, which were called path-tracer "fireflies" in the render. **That file was not an original — it was an asset Framer had already processed.** The lesson is small and costly: **"untouched" must mean untouched by the whole pipeline, not merely untouched by me.** Fetching an asset back from the CDN and calling it the source is circular.

**What is actually happening: Framer runs a pngquant-style quantiser on ingest, and the STORED MASTER is the quantised file.** Requested with no parameters at all, the full-size asset comes back as an **indexed-colour PNG**:

| asset | served | palette |
|---|---|---|
| **a near-white product render** | 1674x1674, 88 KB | **7 colours** |
| Elements card | 2000x1800, 321 KB | 12 |
| Fixtures card | 775x775, 50 KB | 18 |
| hero poster (photo) | 1920x1080, 257 KB | 42 |
| spa photo | 4000x2250, 3549 KB | 99 |

A 1,027 KB truecolour upload comes back as an 88 KB, 7-colour file. **The palette size is content-adaptive, which makes near-flat white renders the WORST case** — the quantiser meets its quality target with almost no colours, then dithers to fake the gradient. That dither is the "discoloration", and it is most visible on exactly the large smooth surfaces these products are made of.

**JPEG is not quantised. Upload these as JPEG.** Served `.jpg` assets come back as real JPEGs — **11,846 distinct colours in a single 200x200 patch** against 7 for the whole PNG. Converted at `-q:v 2 -pix_fmt yuvj444p` (no chroma subsampling, so the thin dark profile edges stay crisp), the 11 renders keep **348 tones** in the cap region versus **7** through the PNG path, at **1.2 MB total** against ~8 MB of PNG.

**Use JPEG for any photographic or smoothly-shaded artwork in this project.** Keep PNG only where transparency is required — and note that a PNG with alpha will be quantised just the same, so a logo or flat graphic is fine but a soft shadow on transparency is not.

**BOTH HOME CARDS SET TO `#f7f6f2` — and the one-level discrepancy was MY PADDING, not Framer (2026-10-08/09).**

**The measurement method matters more than the result here.** Three successive readings of "the card background" disagreed, and only the last was right:

| method | said | verdict |
|---|---|---|
| ffmpeg decode of the served `.jpg` | Elements `#f7f5f2`, Fixtures `#f7f6f2` | misleading — modal average across a defect |
| ffmpeg decode of the served WebP | both `#f6f4f0` | **wrong** — ffmpeg's WebP decode shifts `-1,-2,-2` |
| **browser `fetch` + `createImageBitmap` + canvas `getImageData`** | **the truth** | **use this** |

**The reliable technique: read the pixels in the browser.** `framerusercontent.com` serves permissive CORS, so a page-context `fetch` into `createImageBitmap` and an `OffscreenCanvas` gives the browser's own decode with nothing of ours in the path — numeric, repeatable, and not dependent on a human reading a screenshot. **Do this for any colour question in this project.** Note `<img>` elements will not help: in a backgrounded tab they never lazy-load and report `naturalWidth` 0, and long `await`s in `javascript_tool` time out because timers are throttled — fetch the URL directly and keep each call short.

**The actual defect was self-inflicted.** Repositioning the Elements card to match the original framing meant padding 106px on the left, filled with a flat colour sampled from `B-35`'s corner. That colour sat a level below the background elsewhere in the frame, so the card carried a thin dark strip down its left edge — `0%: 246,245,241` against `10-100%: 247,246,242`, with the boundary at exactly 5.3% of 2000px. **Every "Framer shifted it" theory was wrong; the modal measurement was simply averaging my own strip into the background.**

**Fix: smear, do not fill.** `fillborders=left=108:mode=smear` after the crop replicates the image's own adjacent column into the strip, so it takes the real background rather than an approximation and the encoder then treats the whole flat area as one region. Result verified in the browser: **uniform `247,246,242` at all four corners, the left edge midpoint, and 5% in.** **Prefer edge replication over a flat fill whenever padding a photographic background.**

**The Fixtures card needs no fix and should not be "corrected".** It reads `#f7f6f2` across **55.1%** of frame with a gentle lighting gradient rising to `#f8f7f3` (17.2%) — which is the render's own backdrop falloff, and it **matches the original card's distribution almost exactly** (`58.3%` / `15.3%`). Flattening it would destroy real lighting.

**A pre-compensated file was built and discarded.** It would have shifted the whole image up a level to fix what was wrong in 5% of it — the same error as the placeholder-fill incident earlier the same day, caught this time before it shipped.

**HOME FIXTURES CARD REPLACED — and the current card turned out to be a CROP of a render already on the canvas (2026-10-08).** The card was an **18-colour** `775x775` PNG. Shak pointed at `B-7` (`2000x2000`), which at a glance looks like a different shot — the full module chain receding, where the card is a tight close-up of three modules.

**It is the same render. Found by template search rather than by eye:** the live card was downscaled to a template and matched against every square crop of `B-7`, anchored on both images' shared full-bleed left edge and their subject extremes. The result was a sharp minimum at **772x772 from (853, 720)**, rms **3.97** against **57.33** for the worst candidate — unambiguous. Refining the window and offsets in a second pass took it from 6.28 to 3.97.

Output at `775x775` to match the live card exactly: **vertical bounds identical** (`0.2348..0.7097`), horizontal within `0.8%`, **18 colours becomes 1,570**, 17 KB against 50 KB.

**THIS FIXES QUANTISATION, NOT RESOLUTION — and the distinction matters.** The matching crop is only **772px** of `B-7`, so it carries exactly the same real detail as the card it replaces. The left Home card renders at roughly **1340 device px** on desktop (`745 CSS px` x `120%` x `1.5 dpr`), so a 775px source is undersampled about **0.58x** and **will still look soft**. Upscaling adds nothing. **Fixing sharpness needs a render framed at this close-up directly, at 1500px or more — not a crop of the wide shot.** Worth bundling into the next render batch; it is not urgent, since the colour fix is the visible win.

**The asset id changed on assignment again** (`ZU1dyILT4…jpg` written, `jMvkPme1bduPUF4Ah9fdh5WHJ4.jpg` stored), exactly as it did for the Elements card. **Two for two on Home-collection image fields, zero for sixteen on the product-photo fields** — so the behaviour may be field- or collection-specific, but either way it confirms the rule: **verify a CMS image write by content, never by id.**

**The reusable technique is the template search.** When an existing asset must be matched and the replacement is framed differently, do not eyeball the crop: downscale the live asset to a template, search the candidate over a grid of crop sizes and offsets, and read the rms minimum. Anchor the search on features both images share — here, the full-bleed left edge and the subject's right and bottom extremes — which collapses a three-parameter search to one.

**HOME ELEMENTS CARD REPLACED WITH JPEG, FRAMING MATCHED EXACTLY (2026-10-08).** The card was a **12-colour** PNG — the most degraded asset on the site, dithered across 65% of its blocks, and sitting above the fold. Replaced with a JPEG built from Shak's original.

**This card could not simply be swapped, because its geometry is load-bearing.** The whole tablet/phone centring solution depends on the subject sitting at `f ≈ 0.5828` of a **2000x1800** canvas — that is what makes desktop's `120%` + `flex-end` overflow cancel the subject's own offset, and what the `125%` / `126%` breakpoint widths were solved against. **Shak's new render is 2000x2000**, a different aspect, so dropping it in unchanged would have invalidated all of it.

**Measured the live card first, then rebuilt to match:** current subject centre `x 0.58350, y 0.55500`; the replacement was padded and cropped to land at `x 0.58300, y 0.55556` on a `2000x1800` canvas. **Verified the layer settings afterwards and they are untouched** — `120% / 1.175` desktop, `125% / 0.976` tablet, `126% / 0.926` mobile, exactly as recorded. No breakpoint needed re-solving.

**The new render is NOT an identical re-export** — the spacing between the plate and the side piece is tighter, so the subject is `870px` wide against `962px` while heights match to `0.4%`. **Natural scale was kept rather than stretching to the old bounding box**, since stretching would have rendered the products 10% larger than they are. The pair reads slightly narrower; the objects themselves are correct.

**NEW FACT — A CMS IMAGE WRITE CAN COME BACK UNDER A DIFFERENT ASSET ID.** The canvas drop produced `LfDCvBFJ…jpg`; after assigning that URL to the `Thumbnail Image - Wide` field, two fresh sessions both reported `a5ZpkCXEdhhHHGdqrG6CIBsrSA.jpg`. Framer re-encoded it into a new asset on assignment. The content is correct (`2000x1800`, 2,291 colours against 12, subject in place) and still unquantised. **This did NOT happen on the Fixtures or Elements product-photo writes, where the stored id matched what was passed — so it is not universal and cannot be predicted.** **Verify a CMS image write by CONTENT — dimensions and measured geometry — never by asset id.**

**HERO POSTER REBUILT FROM THE VIDEO ITSELF, NOT RECOVERED FROM THE PNG (2026-10-08).** The poster was a **40-colour** quantised PNG, and on a dark photographic image that is the worst case — the wall carried visible dither speckle and the falloff around the stair lighting banded. **Converting the CDN copy to JPEG would have recovered nothing.**

**The poster is the hero video's own frame 0, so the clean original was already on the server.** Confirmed rather than assumed: the existing poster was matched against every 8th frame of `ege1ICH4tsMvwYK2FTfSBE2frbA.mp4` (1920x1080, 60fps, 476 frames), and **frame 0 scored an RMS difference of 1.38 against 3.10 for the next-closest and 42.73 worst-case** — unambiguous. Extracted at `-q:v 2 -pix_fmt yuvj444p`.

| | colours | size |
|---|---|---|
| old PNG, as Framer served it | **40** | 257 KB |
| video frame 0, lossless | 16,243 | — |
| **new JPEG, as served** | **22,174** | **109 KB** |

**Note the video URL has changed since this file last recorded it** — the hero is now `ege1ICH4tsMvwYK2FTfSBE2frbA.mp4`, not `d77bBFCntsmjWtY8JPzBcIZqc8.mp4`. Read the instance control `xTAfQvz3w` rather than trusting the value written here.

**The poster lives in SIX places and all six were set:** `backgroundImage` on `Container` and the `poster` control on `Container > Video`, across all three variants (`Image`, `Image Active`, `Mobile`). Both are asset-typed, so the live `ImageAsset` was read off the dropped node and assigned **in the same `exec`** with no serialisation — a URL string or a literal fails silently there. Verified across **two** fresh sessions.

**The general lesson is worth more than the fix: before concluding an asset is unrecoverable, check whether a cleaner source of the same pixels already exists in the project.** A poster is a video frame; a thumbnail may be a crop of a full-size image. The quantised copy is not always the only copy.

**SITE-WIDE PNG AUDIT, 2026-10-08 — all 28 PNGs are quantised; four are worth replacing.** Every image referenced by the 10 published pages plus the CMS detail pages was collected (**71 assets: 33 jpg, 28 png, 10 svg**) and each PNG fetched full-size with no query parameters. **28 of 28 are indexed-colour, 20 of them under 32 colours.** The JPEGs and SVGs are untouched by the quantiser, so this is a PNG-only problem.

**Palette size alone does not predict visible damage** — detailed content hides dithering, smooth content shows it. Ranked instead by measured **dither density** (8x8 blocks holding 2-3 tones with >18% horizontal alternation, the dither signature):

| asset | where | palette | dithered blocks |
|---|---|---|---|
| `UjMpyh3Rstt…` | **Home — Elements category card** | **12** | **65.4%** |
| `ifb6mXyk…` | **Careers — gradient abstract** | **16** | **45.2%** |
| `8yvUOxGq…` | **Home — hero poster** | **40** | **40.4%** |
| `ZNDr58rL…` | **Home — Fixtures category card** | **18** | **34.0%** |
| `C6mk4sEY…` | Careers | 147 | 35.3% |
| `iSENb6qU…` | Careers | 97 | 30.6% |
| three photos | careers / news / projects-grid | 256 | 17-21% |
| `dS88nmQ3…` | Home + projects-grid, spa photo | 99 | 9.6% |
| `Zlz1h2Ps…` | **Contact — map** | 17 | **5.3%** |

**The contact map is the instructive case: 17 colours but only 5.3% dithered**, because a dense map has no smooth regions for dithering to show in. **Do not replace on palette size alone.** Conversely the Home Elements card is a product render on near-white — the worst possible content — and it is the most degraded asset on the site while sitting on the home page.

**A low score can also understate the damage.** A fixtures product render scores only 9.7%, because most of its frame is uniform background that quantised to a *single* colour and so is not counted; the dither is concentrated on the product itself, which is the only part anyone looks at. **Read the metric as "how much of the frame carries dither texture", not as "how bad it looks".**

**REPLACEMENT REQUIRES THE ORIGINAL FILES.** Re-encoding a CDN copy as JPEG restores nothing — the colours are already gone. Anything whose original has been lost is permanently degraded at its current quality.

**Note `FryzpZaIs…` on `/elements`: 3504x2478, 8 colours, WITH an alpha channel.** Transparency does not exempt a PNG from quantisation, so "it needs alpha" is not a reason to accept PNG for a soft-shadowed or gradient image.

**Standing rule going forward: upload JPEG for anything photographic or smoothly shaded.** Reserve PNG for flat graphics and hard-edged UI art, where a small palette is lossless anyway.

**JPEG ROUTE CONFIRMED END TO END, 2026-10-08.** Shak exported the 11 fixtures from his own originals as JPEG and dropped them. Framer returned them as **genuine JPEGs at 2000x2000, unquantised** — and after rebinding, the served assets carry **261 to 591 tones in the cap region against 7 through the PNG path**. The artifact is gone at source. All 11 CMS items now point at `.jpg`, zero `.png`.

**His files were raw originals, so the whole geometry pipeline had to be re-applied** (right edges were back to the ragged `55.6-72.6%`, centres `47.5-57.0%`). Matching the 11 unlabelled files (`Revision Round B-5…C-3`) to products was done by **shape signature** — product bbox normalised to a 24x24 ink grid plus aspect ratio — giving a clean bijection with every match confident and no product claimed twice. **That matcher is worth keeping for any future unlabelled batch.** Scale, reposition and crop are applied in a **single ffmpeg pass from his original**, so there is no generation stacking.

**A MEASUREMENT-CONSISTENCY TRAP COST TWO WASTED RENDER PASSES — the fix is the general lesson.** The first attempt produced right-edge spreads of `2.1` and then `1.3`, against the `0.4` the PNG set had achieved. **Nothing was wrong with the transform.** The planner located the product edge as *the outermost pixel carrying any ink*, while the verifier (`measure.js` / `vert.js`) uses an **ink profile and takes the outermost column holding at least 2% of peak ink**. On a product that tapers to a thin tip — `Prisma Link 1` and `2` especially — those two definitions disagree by over a percent of canvas width.

**The tell was that a correction pass did not converge.** Feeding the measured residual back in moved nothing, because each pass was optimising a different target than the one being checked. **When a correction has no effect, suspect that the two measurements disagree rather than that the transform is weak.** Rewriting the planner to use the verifier's exact profile metric landed `0.4` on the first try.

**Final state: right edges `86.3-86.7%`, v-centres `50.0-50.6%`, 700 KB for all 11** (against ~8 MB of PNG). Placeholder fills are back at `#f7f6f2` on all 36. **Needs a publish.**

**ALIGNING ON THE END CAP WHEN A PRODUCT TRAILS A CABLE (2026-10-08).** `Flow Straight` and `Flow Spine` were replaced with assembled-fixture renders (`B-21`, `B-22`) that differ in kind from what they replaced — the old shots were a bare aluminium channel and loose mounting clips, the new ones are the finished fixture with a cable. **The shape matcher flagged them as not matching anything (score 8+ against a 0.3-1.4 range for genuine matches), which is how the content change was noticed** rather than assumed; worth trusting that signal.

**They bleed off BOTH edges, so the default rule mis-framed them.** Aligning the rightmost ink put the *cable tip* on the 86.6% line and scaled the fixture **down** to `0.726`, leaving the body ending near 55% while every other product's body ends at 86.6% — they read as short products with a long tail. Shak's call: **align the end cap and let the cable overrun.**

**Separating cable from body: use ink DENSITY per column, not ink height.** Height fails here because the cable curves and spans almost as much vertical range as the body (it never drops below ~61% of max height, so no height threshold finds the cap). **Density works cleanly** — the body is solid and the cable is a thin line:

```
B-21 density by column:  68 69 71 73 73 75 77 78 81 82 85 85 | 65 23 21 21 20 ...
                                                  end cap ---^
```

Taking **the last column holding at least 50% of peak density** puts the cap at `63.0%` (B-21) and `63.6%` (B-22) — stable, where a 25% threshold is not (it returns 99.9% on B-22 because parts of the cable are locally dense). **Also compute the vertical centre from the body only, left of the cap**, or the curving cable drags it off.

Result: end caps at `86.7%` against `86.6%` for Vena and `86.5%` for Flow 20, body v-centres `50.0-50.1%`, and the cable runs off the right edge instead of terminating inside the frame. **The general rule: when a product has an appendage — cable, lead, bracket — align on the body and let the appendage bleed, measuring the body boundary by column density.**

**Known side effect, do NOT "fix" it by moving the card fill:** JPEG's YUV round-trip shifts the flat background about one level (`247,246,242` -> `246,247,241`). That is below visibility, and **the card fill must not be adjusted to chase it** — doing exactly that, on a decoded measurement, is what put a wrong fill on the live site earlier the same day. Verify against a screenshot of the rendered page before changing any fill.

**Why none of the earlier analysis caught this.** The investigation measured the `.png` URL, the WebP derivative and the source, and reasoned about delivery — but never compared the *stored* asset against the *uploaded* file. The one check that exposed it is trivial: **read the IHDR colour type of the asset Framer serves with no query parameters, and compare it to what you uploaded.** Colour type `3` means indexed, and the `PLTE` chunk length divided by three is the palette size.

### THE ENSO THUMBNAIL VIDEO, AND WHY A VIDEO CANNOT CARRY AN EXACT RGB VALUE (2026-10-09)

The middle Newsroom card on Home is not an image — it is **`Thumbnail Video MOV`** on the News item *"The making of an award-winning website"*, the only one of the three live articles with no still `Thumbnail`. **That is why no image audit ever saw it.** Check `Thumbnail Video MOV [file]` on the News collection, not just the image fields.

**THE LIVE FILE IS ALREADY SHAK'S CORRECTED EXPORT — confirmed by exact byte match.** The served asset is **3,704,485 bytes**, identical to `alkimi-orb-enso-universal-v5-light-f7f6f2.mov` in his Drive (created 2026-10-05). **A byte-size match against the source file is a cheap, decisive identity check** and should be the first move before measuring anything.

**It still does not render as `#f7f6f2`, and that is inherent to video.** Measured through the browser's own decoder: **`249,247,243`**, uniform across four corners, five timestamps, 30 samples. The file declares **no colour space and no colour range** (`color_range=unknown`), so every decoder guesses the YUV->RGB conversion.

**Tagging does not fix it.** `-c copy` with `-color_range pc/tv -colorspace bt709` produces a byte-faithful stream with explicit tags, and Chrome renders all three variants **identically** at `249,247,243`. Chrome ignores them for this h264 path. **Do not spend time on colour metadata here.**

**A re-encode genuinely helps, and an earlier note in this file said the opposite.** That claim — "re-encoding costs a level before it does anything useful, so correcting is strictly worse" — came from measuring with **ffmpeg, which reads this video two levels low across every channel** (`247,245,241` where the browser shows `249,247,243`). Measured properly:

| | browser renders | distance from `#f7f6f2` |
|---|---|---|
| original, live | `249,247,243` | **4 levels** (+2,+1,+1) |
| plain re-encode at matched bitrate | **`247,246,241`** | **1 level** (blue only) |
| `+2` on blue | `247,245,244` | 3 levels — overshoots |
| any negative offset | `245,243,239` | all collapse to the same value |

**Exact `247,246,242` is not reachable** — blue quantises between 241 and 244 with nothing in between. `alkimi-orb-enso-v6-f7f6f2.mov` (3,286 KB against the original's 3,617 KB, same 1000x1000 / 30fps / 500 frames) is the closest obtainable, and it needs **no colour offset at all** — the plain re-encode is what moves it.

**THE MEASUREMENT RIG IS THE REUSABLE PART.** A video cannot be measured with ffmpeg in this project. The working method, with no upload and no publish:

1. Serve the candidates from a throwaway local HTTP server (`file:` is blocked in the browser tool).
2. Navigate a real browser to that page and read pixels via `<video>` -> `canvas` -> `getImageData`.
3. Sample several timestamps and all four corners; a uniform result across 30 samples is what makes it trustworthy.

**This is the fourth ffmpeg colour misreading recorded here, and the first on video.** The pattern is now unambiguous: **ffmpeg is a transformation tool, not a measuring instrument. For any colour question in this project, measure in a browser.**

**THE ORB AT 60FPS — and how to tell real smoothness from a bigger file (2026-10-09).** Shak asked to make the enso thumbnail 60fps so it "runs smoother". **Setting the container to 60fps achieves nothing**, and that was proven rather than asserted: a `fps=60` filter produced frames whose consecutive deltas alternate `0.00, 2.04, 0.04, 2.04` — **half the frames are exact duplicates**, identical motion at +54% file size. Motion-compensated interpolation produced uniform deltas of `1.07-1.12`, i.e. genuinely new in-between frames.

**THE VALIDATION IS THE REUSABLE PART — interpolation can be checked against GROUND TRUTH.** Rather than guess whether the synthesised motion is faithful, drop the source to **half** its rate, interpolate back up, and compare the invented frames against the real ones that were removed:

| | mean error vs the real frame |
|---|---|
| synthesised frames | **0.44** |
| carried-over frames | `0.10` (the encode noise floor) |
| *real motion between consecutive frames* | *2.30* |

So each synthesised frame lands within **19% of the motion it is inventing** — reconstructing about four-fifths of the true movement, with worst-case single pixels off by 57. **Soft content with no hard edges interpolates well; this test tells you before you commit.**

**Judder was NOT obviously the problem, and that was said before building anything.** Inter-frame motion measured a mean delta of `2.30` with ~8.8% of pixels moving, **identical frame to frame** — a slow even drift, which is exactly the case where 30fps usually reads fine. Shak watched a 5-second A/B and judged 60fps smoother, so it shipped on his eye, not on the numbers.

**Final: `alkimi-orb-enso-v7-60fps.mp4`, 997 frames, 16.617s, 4,280,052 bytes.** Verified served byte-identical, and **the background survived the extra encode at `247,246,241`**, re-checked in the browser across 20 samples — worth doing every time, since each encode is a fresh chance for colour to drift.

**Two details worth carrying:**

- **Higher frame rates compress BETTER per frame**, because each frame differs less from the last. The naive projection was 5.1 MB; at `2200k` it came in at **4.2 MB**, only +27% over the 30fps original rather than the expected +54%.
- **`minterpolate` cannot synthesise past the final frame**, so the clip lost 3 frames (`16.667s -> 16.617s`). Invisible on a loop, but it means output duration is not exactly input duration.

**A native 60fps re-render from the orb's source would still beat this** — no synthesised frames, no artifacts, probably smaller. Worth asking before treating v7 as permanent.

**PUBLISHED AND VERIFIED LIVE 2026-10-09.** Home serves the 60fps orb across all three breakpoints (3 references), hero video unchanged, no trace of any older enso asset, badge `0`. The served file re-confirmed after the publish: `4,280,052` bytes, `1000x1000`, `r_frame_rate=60/1`, `997` frames, `16.616667s`. Full Home regression sweep clean — **11** emitted `aspect-ratio:1.17458` with **0** stale `1.180xx`, both Elements breakpoint ratios (`.975765` / `.925714`) intact, 2 hero overlay `rgb(8, 2, 0)`, placeholder `#f7f6f2` with **0** of the wrong `#f6f4f0`, brand green present, and **0** stale `View Case Study` labels.

**TWO QUANTISED PNGs REMAIN ON HOME, AND THEY ARE DELIBERATELY NOT BEING REPLACED.** The sweep found `40gwemCb3bx5lAB08TgvBTsc.png` (`2520x3100`, **69 colours**, 2,390 KB) and `IGRnLlfnV6mJeCUNwD1NOiidU.png` (`2287x1266`, 256 colours, 1,011 KB) still indexed-colour. Both are **stock Ora news-article thumbnails** — they hang off `./news/our-brand-for-mush-energy-has-just-won-2-silver-awards` and `./news/how-aesop-has-reshaped-the-industry`, two of the three template articles already queued for deletion in the cleanup bundle. **Replacing artwork for content that is about to be removed is wasted work**, which is the same reasoning that defers the four `/careers` PNGs. They go when the articles go.

**Correcting an over-broad claim made on 2026-10-08:** the PNG audit's summary said the only PNGs left were the four on `/careers`. That was wrong — these two were on the home page the whole time. The audit itself had collected them; the *summary* lost them, because the ranking was by dither density and a detailed photograph scores low (the same reading trap already recorded two paragraphs up). **Rank for triage, but enumerate for completeness** — the count of remaining PNGs must come from the full list, never from the top of a ranked one.

**The green check needs the right spelling.** A sweep for `rgb(53, 121, 11)` returns **0** on Home while the colour is plainly there — Framer emits it as **`#35790B`** on this page. A colour absent in one notation is not a colour absent. Grep both forms before calling a brand colour missing.

### /projects-list — the empty 5th image box is a per-instance BOOLEAN, not CMS (fixed 2026-10-09)

Shak spotted that `Resorts World` rendered four photos **plus an empty striped placeholder**, while `Belmont Park` with the same number of photos rendered four and stopped cleanly. His question — CMS or canvas — is the right one, and the answer is **canvas**.

**The CMS is identical on the two items, which is what rules it out.** Both carry `Image Hero`, `Image 1`, `Image 2`, `Image 3` filled and **`Image 4` empty**, and both have the enum **`5 Images on List View` (`fY2GuGkFp`) set to `Yes`** — as do all ten Projects items. **Same CMS value, different render, so that enum is demonstrably not the driver.** Do not reach for it; it is inert for this purpose.

**The real switch is a boolean control on the row instance: `idiWQDru6` on `Projects / List View Row` (`local-module:canvasComponent/BPcTbqUr_:default`).** Each of the ten `/projects-list` rows is a Collection List holding one such instance, and the value was set per row, inconsistently:

| row | item | was | renders |
|---|---|---|---|
| 1 | Resorts World | `true` | 5 slots, 4 images -> **empty box** |
| 2 | Belmont Park | `false` | 4 slots -> clean |
| 3 | Tuft | `true` | 5 slots, 5 images -> correct |

**It gates `Image Wrapper 4` — the fifth slot — and that was proven from the PUBLISHED page, because the binding is invisible to the node API.** All five wrappers (`Image Wrapper Hero`, `1`, `2`, `3`, `4`) read `visible: true` inside the component, and a recursive probe of every attribute on every layer found **zero** references to `idiWQDru6`: conditional-visibility bindings simply do not surface through `getChildren`/attributes, the same blind spot as code overrides and the hover rise. Counting `data-framer-name="Image Wrapper …"` per row on the served HTML settles it in one query:

```
resorts-world   wrappers: Hero,1,2,3,4
belmont-park    wrappers: Hero,1,2,3      <- slot 4 not emitted at all
the-leader      wrappers: Hero,1,2,3,4
```

**That is the general method for any Framer conditional binding: do not look for the condition on the canvas, count what the published page actually emits.** A layer dropped by a false condition is absent from the HTML entirely, which is unambiguous — unlike `visible: false`, which the canvas does report.

**Why the two look so different rather than just one box apart.** The image stack is right-aligned, so removing a wrapper shifts the remaining four right against the same edge; keeping it leaves a gap on the left and parks Framer's diagonal placeholder tile at the end. **Seeing that striped tile here means an empty bound slot, not a missing asset** — same tile as the Home card note, different cause.

**Fixed** by writing `idiWQDru6: false` onto the Resorts World row instance (`K4t4HTTfI`). Verified in **two** fresh sessions, with `variant` and the `/projects/:slug` link preserved — **a partial `controls` write does not clobber the siblings it omits**, which is worth knowing given `variant` itself cannot be written at all. **Needs a publish.**

**Tuft stays `true` deliberately** — it is the only live project with five real images (`Image 1-4` plus a hero poster), so turning its fifth slot off would drop a real photograph.

**THIS IS A PER-ROW SETTING AND IT WILL BITE AGAIN.** The seven hidden draft rows carry mixed values (`4, 6, 7, 8, 9` = `true`; `5, 10` = `false`) with no relation to their items' image counts. **Whenever a project goes Live, set this row's `idiWQDru6` to match whether that item actually has an `Image 4`** — exactly as the static `(3)` count label has to be updated by hand. The underlying design flaw is that the component asks the canvas a question the CMS already knows the answer to; if the two are ever reconciled, bind the fifth wrapper's visibility to `Image 4` being non-empty and the whole class of defect disappears.

### The Resolution dropdown IS scriptable — and `addItems` SILENTLY UN-DRAFTS (2026-10-09)

**The setting is `resolution: "auto" | "lossless" | "small" | "medium" | "large" | "full"`, and it lives in TWO different places depending on how the image got there.** An earlier reading of this concluded it was editor-only; that was wrong, and it was wrong because the first diff compared the wrong pair of nodes.

| image source | where resolution lives | how to change it |
|---|---|---|
| placed on the canvas | `node.backgroundImage.resolution` (an `ImageAsset` field) | `asset.cloneWithAttributes({ resolution: "auto" })` then `setAttributes({ backgroundImage: next })`, **in the same `exec`** — it is a live asset, so the usual no-serialisation rule applies |
| bound from the CMS | `item.fieldData[fieldId].value.resolution` | the write schema accepts **`null \| string` only**, so pass `value: v.url` — **writing the URL back resets resolution to `auto` and does NOT re-encode; the asset id is unchanged** (verified) |

**Finding it took a second diff.** The first compared a CMS-bound `Image Hero` against a `Product Photo` and showed only layout differences, because **a CMS-bound layer's `backgroundImage` is a placeholder whose `resolution` reads `null`** — the real value is in the item data. Note `imageRendering` exists on every node and is `null` on all 219; it is **not** this setting. The answer was in `docs ImageAsset`: *"The resolution set on the image. Defaults to auto."*

**What `full` and `lossless` actually emit** — two different wastes, and neither is what the name suggests:

- **`full`** emits **no `srcset` at all**, just one full-size URL (`?width=1200&height=1384`). No responsive sizing; every visitor gets the full-resolution file.
- **`lossless`** emits the normal `srcset` **plus `&lossless=1`** on every candidate — 5.4x the bytes for a difference measured at mean `0.153` levels.

**Applied 2026-10-09: everything set to `auto`** — 92 CMS image values (Home 10, Projects 55, News 26, plus one test) and 17 canvas nodes at `full`. Verified in two fresh sessions: **117/117 CMS values `auto`, all 219 canvas nodes `auto` or unset.** No image carried alt text, so the URL rewrite lost nothing. **Needs a publish.**

**!!! `Collection.addItems` RESETS `draft` TO FALSE ON ANY ITEM IT TOUCHES !!!**

The CMS pass above passed only `{ id, fieldData }`. Every item it updated came back **`draft: false`**, taking **Projects from 3 Live / 7 draft to 10 Live** and **News from 3 Live / 4 draft to 7 Live** — seven stock-template case studies and four template articles armed to publish. Nothing shipped, because it was caught before any publish, but **a publish in that window would have put template content on the live site.**

**`CollectionItemInput` carries `draft`, and omitting it does not mean "leave alone" — it means `false`.** Same family as the positioning-attribute trap (writing a mode's fields without clearing the old mode's) and the breakpoint-cascade trap — *"a breakpoint you skip is not a breakpoint you preserved"*. **Rule: every `addItems` call that updates existing items must pass `draft` explicitly**, carried through from the item you read: `{ id: i.id, draft: i.draft, fieldData: {…} }`.

**Always re-check draft counts after any CMS write.** The check that caught this was incidental — a listing filtered on `!i.draft` showed `Sayso` and two `… Copy` items, which are known drafts. **A write-verification that only re-read the field it had changed would have passed clean and left the project armed.** Verify the invariants you did not intend to touch, not just the ones you did.

**The authoritative record of which items were live is the PUBLISHED build, not this file.** `/news` and `/projects-list` list exactly the live slugs:

```
Projects LIVE: belmont-park, resorts-world, the-leader
News     LIVE: how-aesop-has-reshaped-the-industry,
               our-brand-for-mush-energy-has-just-won-2-silver-awards,
               the-making-of-an-award-winning-website
```

Note those project slugs are **no longer the old Ora ones recorded elsewhere in this file** (`positive-energy` / `first-round` / `the-leader`) — two of the three have since been renamed, so that older note is stale.

**Scripts: [repair/restore-draft-status.js](repair/restore-draft-status.js)** (aborts if any expected live slug is missing, then sets `draft: true` on everything else) and **[repair/verify-draft-status.js](repair/verify-draft-status.js)** (read-only; expects Projects 3, News 3, Home 2, Fixtures 11, Elements 5).

**RESOLVED AND PUBLISHED 2026-10-09.** Shak ran the repair and published. Draft status verified in **two fresh sessions** (Projects 3/10, News 3/7, Home 2/2, Fixtures 11/11, Elements 5/5) **and against the published build, which is the check that matters** — the live site serves exactly `belmont-park`, `resorts-world`, `the-leader` plus the three template articles. **No template content leaked.**

**Measured result of the `auto` change:**

| | before | after |
|---|---|---|
| Home image weight | 7,658 KB | **1,037 KB** (-86%) |
| `/projects-list` | 2,075 KB | **561 KB** (-73%) |
| `lossless=1` across all 9 pages | 223 | **0** |

The `/projects-list` fifth-slot fix shipped in the same publish: `resorts-world` renders **4 wrappers / 4 images** with no empty placeholder, matching `belmont-park`; `the-leader` keeps its genuine 5/5. Full Home regression sweep passes (11x `1.17458`, 0 stale `1.180xx`, both Elements breakpoint ratios, 2 hero overlays, `#f7f6f2` with no `#f6f4f0`, brand green, no stale `View Case Study`, 60fps orb on 3 breakpoints, badge 0).

**Keep `repair/verify-draft-status.js`** — it is the cheapest guard against this trap recurring, and it should be run after **any** CMS write, not only after one that touched `draft`.

**DID THE `auto` CHANGE COST ANY FIDELITY? Measured on both axes 2026-10-09 — resolution: no. Compression: nothing visible on renders, measurable on photographs.**

**Axis 1, resolution — nothing lost.** Every image is still at or above display resolution. `/projects-list` thumbnails decode at `512px` into a `188` device-px box (**2.73x**), and the `/careers` images that were on `full` now sit at `1.05x-1.97x`. Three images on the site *are* below 1.0 — `EhDNivwW` on `/careers` (0.83), and `es1Imfj6` (0.53) and `G9BZgzpc` (0.58) on the project detail pages — but **all three are source-resolution limits that predate the change**, proven by diffing the pre- and post-change published HTML: their markup is byte-identical apart from the removed flag, and `EhDNivwW`'s master is only `1920x1080` against a `2304` device-px box. Only a bigger render fixes those. (`G9BZgzpc` is the 772px Home Fixtures crop already flagged as soft for exactly this reason.)

**BEWARE `naturalWidth` WHEN A SRCSET USES `w` DESCRIPTORS — it is not the decoded size.** A first pass reported **every** `/projects-list` image as `0.66x` undersampled and looked like a serious regression. It was a measurement error: with `w` descriptors the browser divides intrinsic dimensions by the selected candidate's effective density, so a 512px file chosen for a 125px slot reports `naturalWidth: 124`. **Measure the real thing by fetching `currentSrc` and reading `createImageBitmap(...).width`** — that gave `512` and the true `2.73x`. The giveaway was that every image reported the identical `124` regardless of its source aspect.

**Axis 2, compression — content-dependent, and the earlier blanket "not visible" was too broad.** Measured as mean absolute per-channel difference between the served lossy WebP and the lossless one at the same candidate size:

| content | mean delta | max | where it renders |
|---|---|---|---|
| product render (`/products`) | **0.153** | 10 | 2.8x oversampled |
| Home Fixtures card | **0.219** | 9 | — |
| Home Elements card | **0.195** | 12 | — |
| project photo, 512px thumbnail | **2.98** | 106 | downsampled 2.7x to 188px |
| project detail large photos | **1.77 - 2.71** | 80 - 101 | only **1.17x - 1.83x** oversampled |

**Renders and flat graphics are unaffected** — a mean of 0.2 levels out of 255 is not a visible quantity. **Detailed photographs genuinely differ**, and the thumbnails get away with it because the browser averages ~7 source pixels into each device pixel. **The project DETAIL pages are the one place with little headroom**, at 1.2-1.8x oversampling on large photographs.

**Judgement: leave it at `auto`.** A mean of ~2/255 is below the just-noticeable threshold for photographic content, the max figures are isolated ringing at hard edges, and lossy WebP for photographs is the ordinary choice everywhere on the web — lossless WebP for photos is the unusual option, which is why it cost 5.4x. **If a conservative call is ever wanted, the only defensible candidates are the `Image Hero` / `Image 1-4` fields on the three live Projects items** — a handful of values, rendering large, on the portfolio pages. Everything else should stay `auto`.

**CORRECTION — one of the two "stock template" Home thumbnails is ALKIMI'S OWN ARTWORK (2026-10-09).** Earlier today both Newsroom card images were dismissed as *"two stock-template thumbnails already queued for deletion"*, on the strength of the articles they hang off being the template's (Aesop, Mush Energy). **The Aesop card's image is not template art.** `IGRnLlfnV6mJeCUNwD1NOiidU.png` (`2287x1266`) is **bit-identical** to `Peacock Feather.png` in Shak's Drive at `G:\My Drive\Claude\Alkimi\` — verified by decoding both in the browser and differencing: **mean 0, max 0** across all 2,895,342 pixels.

**So deleting the template articles would take a piece of Alkimi's own imagery with them.** Keep the asset; the *article* is template content, the *picture* is not. (The Mush Energy card was not checked and may or may not be the same situation — check before deleting that one too.)

**How the match was spotted, which is the reusable part:** the distinct-colour count. The peacock PNG decodes to **899,070** distinct colours and the live Aesop asset had measured **899,070** in an unrelated earlier check. **A tone count is effectively a cheap fingerprint for "is this the same image"** — far quicker than a template search, and it survives format conversion well enough to be worth trying first. Confirm a hit with a real pixel difference, as here.

**JPEG conversion of that PNG, for reference** (`-q:v 2 -pix_fmt yuvj444p`): `3.96 MB -> 0.60 MB`, **15.1%** of the original, at **PSNR 43.9 dB**, mean delta `1.176`, max `19`, retaining 535,825 of 899,070 distinct colours. **Its alpha channel was 100% opaque** — 2,895,342 of 2,895,342 pixels at `alpha 255` — so nothing was lost to the lack of transparency in JPEG. **Always measure alpha coverage before converting an RGBA PNG**: a dead alpha channel makes the conversion free, while real transparency forces a matte colour choice that is very hard to undo.

### The Home wide card is wired to PROJECTS, not Home (traced 2026-10-11)

The full-width card under the Fixtures/Elements pair is `Home / Home - Projects Row 2` (`QOhH3GYAD`), variant `Home Project Single - Wide` (`Q__AVxo4P`). Its page instance carries `{"variant":"Q__AVxo4P","VKA4llfY9":1,"L2MOOUbt9":2,"sERka2TFV":2}`.

**`sERka2TFV` is the wide selector and it resolves against the PROJECTS collection** — this is the documented one-component-two-collections trap, confirmed by tracing the rendered asset rather than by reading the binding:

| card | control | collection | item | asset |
|---|---|---|---|---|
| two-up left | `VKA4llfY9: 1` | **Home** | Fixtures (SO 1) | `G9BZgzpc….jpg` |
| two-up right | `L2MOOUbt9: 2` | **Home** | Elements (SO 2) | `X4rVDH7X….jpg` |
| **wide** | **`sERka2TFV: 2`** | **Projects** | **Belmont Park (SO 2)** | `8yvUOxGq….png` |

**CORRECTING THE PNG AUDIT: `8yvUOxGqyLzb66t3xaX6xcUhkBY.png` was recorded as "Home — hero poster". It is not.** It is **Belmont Park's `Thumbnail Image - Wide`**, rendering in the Home wide card. The hero poster was separately rebuilt as a JPEG on 2026-10-08 and is a different asset. Two Home notes are affected: the audit row calling this the poster, and the 2026-10-09 claim that the only PNGs left on Home were the two article thumbnails — there are **three**. (Harmless now that the quantisation finding is overturned, but the label was wrong.)

**The method that settled it, and it is the reusable part:** collection bindings do **not** surface through the node API — a recursive probe of every attribute matching `/collect|filter|sort|data|source|cms/i` across the whole variant returns nothing, and `getCollection(id)` is the only collection-side method in the docs. So **trace the rendered asset id back through every CMS image field instead**. One pass over all collections comparing `fieldData[f].value.id` against the ids in the published HTML names the owning item unambiguously — far quicker than reasoning about which control points where.

**To move the wide card onto the Home collection, four things are needed and one of them cannot be scripted:**

1. **A third Home item at `Sorting Order 3`** — Home holds only `Fixtures` (SO 1, slug `polestar`) and `Elements` (SO 2, slug `arrival`), and both are already spoken for by the two-up row. Scriptable, but **pass `draft` explicitly** (see the `addItems` trap).
2. **Re-point the Collection List** inside `Q__AVxo4P` -> `Project Left` from Projects to Home. **EDITOR ONLY** — there is no API for a collection binding.
3. **`sERka2TFV: 2 -> 3`** on the Home page instance. Scriptable; it is not the `variant` control, so it writes fine.
4. **Fix the button link.** The wide card's `Utilities / Primary Button` carries `NhREodF7M: "/projects/:slug"`, which only resolves for a Projects item. Home slugs are `polestar` / `arrival` and **have no pages**, so the button would link to a 404. Point it at `./products` / `./elements` or hide it.

**No new CMS fields are required** — `Home` and `Projects` carry **identical schemas** (25 fields each, both including `Thumbnail Image - Wide`), which is what makes this cheap.

**The cheaper alternative, if the goal is only a different picture:** leave the wiring alone and either change `Thumbnail Image - Wide` on the Projects item it already points at, or set `sERka2TFV` to another Projects `Sorting Order`. One value, no editor work, no link problem.

**MOVING THE WIDE CARD ONTO THE HOME COLLECTION — step 1 of 4 done, 2026-10-11. NOT YET PUBLISHED.**

Shak asked for a Home-controlled slot rather than a different picture.

**Step 1 (done): a third Home item exists at `Sorting Order 3`** — Title `Projects`, slug `projects`, `draft: false`, `Thumbnail Image - Wide` deliberately set to **the asset the card already shows** (`8yvUOxGq….png`, borrowed from Belmont Park) so the rewire lands with **no visible change**. Verified in two fresh sessions. **`repair/verify-draft-status.js` was updated from Home 2 to Home 3**, and all other collections re-checked unchanged (Projects 3/10, News 3/7) — the `addItems` draft trap did not bite, because `draft` was passed explicitly.

**Adding the item is safe because the Home collection has NO detail-page template.** The page list is `/`, `/404`, `/about`, `/careers`, `/contact`, `/elements`, `/news`, `/news/:slug`, `/privacy`, `/products`, `/projects-grid`, `/projects-list`, `/projects/:slug`, `/terms` — there is no `/home/:slug`, so a new item publishes **no new URL**. Check this before adding an item to any collection.

**Step 2 (EDITOR ONLY, outstanding): repoint the Collection List.** `Home / Home - Projects Row 2` -> variant `Home Project Single - Wide` (`Q__AVxo4P`) -> the **`Project Left`** layer is the Collection List rendering the card; change its source from **Projects** to **Home**. There is no API for a collection binding.

**This is contained, and that was checked rather than assumed.** `Home - Projects Row 2` (`QOhH3GYAD`) has **exactly one instance on any page** — Home, wide variant. The row on `/projects/:slug` (three instances, the "Lighting options" row) is the *other* component, `Home - Projects Row` (`z64WCa5DN`), which is not being touched. **Do not confuse the two** — the standing rule says mirror changes across both row components, and this is the documented exception where you must not.

**Steps 3 and 4 are deliberately HELD until step 2 lands**, because doing them early ships a wrong card:

- **3. `sERka2TFV: 2 -> 3`** on the Home instance. Done now, while the list still points at Projects, it would select **Projects SO 3 = Tuft** and publish the wrong photograph.
- **4. The button link.** The wide card's `Utilities / Primary Button` carries `NhREodF7M: "/projects/:slug"`. Once the card is a Home item, `:slug` resolves to `projects` / `polestar` / `arrival` and **no such page exists** — it must become `./projects-grid` or `./projects-list` (the real projects pages), or the button must be hidden. Note the hover gesture variant `uR6T4xhGK` carries its own copy of this control (`"View Case Study"`), so **both need setting**.

**Sequencing rule worth keeping: when a rewire spans an API change and an editor change, order the steps so that no intermediate state is publishable-wrong.** Here step 1 is invisible (nothing points at Home SO 3 yet) and steps 3-4 are invisible-but-wrong until step 2 exists, so the only safe order is 1 -> 2 -> 3/4 -> publish once.

**Step 4 (done, 2026-10-11): the wide card's button now points at `/projects-list`.** Shak's choice of destination. Written to the `Project Left` button (`…beNpOjgIR`) on **all three** variants that render the wide card — `Q__AVxo4P` (desktop base), `uR6T4xhGK` (hover gesture) and `tDcw55E8Q` (mobile). Verified in two fresh sessions: labels (`"Projects"`) and `variant` preserved, and **exactly 17 other buttons on the component still read `/projects/:slug`**, which is the expected count and the check that proves a partial `controls` write did not clobber its siblings.

**The component carries 20 buttons across 10 variants** — two per variant (`Project Left` + `Home Project Right`). Only the three wide ones were touched; the `Home Project Right` button does not render in a wide variant, and the two-up variants of Row 2 never render at all.

**The link fix was necessary, confirmed rather than assumed.** The published Home page emits `./projects/belmont-park` twice — the wide button, which resolves today **only because the card is still a Projects item**. After step 2 it would have become `/projects/projects`. Checked live: `/projects/polestar`, `/projects/arrival` and `/projects/projects` all return **404**; `/projects-list` returns **200**.

**No pre-existing 404 on Home.** The two-up cards are Home items whose slugs have no pages, so their `View Case Study` buttons would be broken links — but **Framer emits no `href` at all for an unresolvable CMS link**, and the published page carries no `/projects/polestar` or `/projects/arrival`. Worth knowing: an unresolvable CMS link fails silently by being omitted, not by shipping a dead URL, so this class of fault will never show up in a link check of the published HTML. Read the control, not the page.

**Running state: steps 1 and 4 done, step 2 (editor) outstanding, step 3 held.** Step 4 is publishable-safe on its own — it only changes where the wide button goes, from the Belmont Park case study to the projects list.

**THE COLLECTION LIST SOURCE IS EDITABLE ONLY ON THE PRIMARY VARIANT — and it applies to the WHOLE component (found 2026-10-11).** Selecting `Project Left` inside `Home Project Single - Wide` shows **Content -> Source: `Projects` GREYED OUT**, with the note *"Can be selected in the primary breakpoint."* The same layer selected under **`Home Projects - Initial State · Primary`** shows the identical dropdown **enabled**.

**So a Collection List has ONE source for the entire component, not one per variant.** Changing it on the primary switches every variant of `Home - Projects Row 2` at once. That is safe here only because **the component's single page instance renders the wide variant** and its two-up variants render nowhere — verified by instance count, not assumed. **Do not generalise this to `Home - Projects Row`**, which has four page instances.

**How to reach it, since component-internal ids are not addressable:** the editor deep link `https://framer.com/projects/Alkimi-Shak--Cf6zWteoRnYaaVh8Afqa-b8JbM?node=<id>` **works for a component id** (`QOhH3GYAD` opens `Home - Projects Row 2`) but **silently falls back to the Home page for a component-internal id** — `?node=Q__AVxo4PTHAHLpogX` rewrote itself to `?node=augiA20Il`. Same limitation as `framer.getNode`. So deep-link to the **component**, then use the Layers panel.

**The layer tree is readable from the main document and gives untruncated names**, which is how to tell three similarly-named variants apart — the panel displays `Home Project Single ...` three times, while the DOM returns `Home Project Single - Wide`, `Home Project Single Wide - Mobile` and **`Home Project Single - Wide · Hover`**. The editor labels the gesture variant with a `· Hover` suffix that the API does not expose (the API returns two children both named `Home Project Single - Wide`, which is the already-recorded "key by id, never by name" trap seen from the other side).

A plain `computer left_click` on the panel did **not** register, while dispatching `pointerdown/mousedown/pointerup/mouseup/click` on the element did — consistent with the standing guidance to drive this panel through the DOM.

**What the panel shows on that layer:** `Source: Projects`, `State: Default | Empty`, `Filters: Sorting Order`, `Sorting: Reverse`. **After switching the source to `Home`, re-check the `Sorting Order` filter** — it is the binding `sERka2TFV` feeds, and it is the thing most likely to reset when the collection underneath it changes.

**DONE AND PUBLISHED 2026-10-11 — the wide card is Home-controlled. But it is held in place by SORT ORDER, not by a filter, and that is fragile.**

Shak repointed the Collection List and published. **The live wide card now renders `Home` SO 3 (`Projects`)** — and he also swapped its picture, so the published asset is `YiHAIuLBpK6Sk7Z7wCuwHGkm61w.jpg` rather than the placeholder it was seeded with. Verified by tracing the rendered asset through the CMS.

**Everything else on the page is clean.** The two `./projects-list` hrefs are the wide card's own buttons (desktop `Button Blue to White`, mobile `Button Blue - No Hover`); the three `./projects-grid` hrefs are **footer sitemap links and pre-existing**. Full Home regression sweep passes — 11x `aspect-ratio:1.17458`, 0 stale `1.180xx`, both Elements breakpoint ratios, 2 hero overlays, `#f7f6f2` with no `#f6f4f0`, brand green, 60fps orb on 3 breakpoints, `lossless=1` 0, badge 0.

**THE PREDICTED RISK MATERIALISED: the filter did not survive the source change.** The panel on `Project Left` now reads **`Filters: Inactive`**, with `Sorting: Reverse` still on — and the page instance has **lost its `sERka2TFV` control entirely** (it now reads `{"variant":"Q__AVxo4P","L2MOOUbt9":2}`).

**So nothing is pinning the card to SO 3.** With no active filter, `Reverse` sorting and a limit of 1, the list simply takes the **highest `Sorting Order` in the Home collection** — which is 3 today. That the right item renders is a coincidence of ordering, not a binding.

**The consequence to know: add a fourth Home item and the wide card silently switches to it.** It will not error and nothing will look broken; the home page will just start showing different artwork. The limit of 1 is confirmed from the published HTML — three Home items exist and the card renders **once per breakpoint**, not three times.

**To make it robust:** reactivate `Filters` on `Project Left` (primary variant) and pin it to `Sorting Order` = the wide selector. If reactivating rebinds it to a variable, the instance control reappears and can then be set explicitly through the API, the way `sERka2TFV` was before. **Until that is done, treat the Home collection's `Sorting Order 3` as load-bearing and do not add a higher-numbered item.**

**The general lesson, now evidenced twice in one task:** changing a Collection List's source **silently drops the filter that depended on it**, and the page-level control that fed that filter **disappears from the instance** rather than erroring. Neither failure announces itself, and the page can keep rendering the right thing for the wrong reason — so after any source change, re-read the panel for `Filters: Inactive` and re-read the instance's controls, not just the rendered output.

**TIDIED 2026-10-11 — the filter is reactivated and pinned. NEEDS A PUBLISH (editor shows "1 change").**

The wide card's `Project Left` now reads **Source `Home`**, **Filters `Sorting Order` -> `Equals` -> `3`**, with `Sorting: Reverse` and `Limit to: 1` left in place (both now inert, since exactly one item matches). The card is no longer held in position by sort order — it is bound.

**Why the filter had gone inactive, seen directly:** opening it showed **`Field: Select…`** — empty. The filter object survived the source change, but its *field* did not, because the field it named belonged to Projects. Framer leaves the orphaned filter in place and marks the whole thing `Inactive` rather than deleting it or warning. **So "Filters: Inactive" means "the filter exists but its field is dangling", and the repair is to re-pick the field, not to rebuild the filter.**

**The filter panel is native `<select>` elements**, so the recorded method applies: `Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(sel, v)` plus `input` + `change`. Two selects in the popover — field (29 options, the Home schema) and comparison (`Is set`, `Isn't set`, `Equals`, `Doesn't equal`, `Greater than`, `Less than`, `Less than or equal`, `Greater than or equal`). **`Equals` reveals a `Value` number input that defaults to `0`** — which matches nothing, so the card would have gone blank had it been left there. Set it in the same pass.

**Note what `Is set` would have done:** it is the default on picking a field, and it matches **every** item that has a value. Combined with `Reverse` + `Limit 1` that reproduces the exact fragility being fixed — right answer, no binding. **`Is set` is not a filter; treat it as a placeholder.**

**The value is a literal `3`, not a variable.** The original design fed this from the instance control `sERka2TFV`, which vanished with the source change and was not restored. That is acceptable **only because this component has exactly one page instance** — a literal would be wrong on `Home - Projects Row`, which has four and needs per-instance selection. **If Row 2 is ever reused on another page, convert this back to a variable first.**

**Side effect, harmless and worth knowing:** the primary variant's canvas now renders the `Projects` Home item in its left card rather than `Fixtures`, because the filter is shared across the component's variants. Row 2's two-up variants render nowhere on the site, so this is canvas-only.

### `/projects-list` row images — the slot mapping, and Tuft is pulling from NOTHING (2026-10-11)

**The five slots bind to `Image Hero` + `Image 1-4`.** `Thumbnail Image - Wide` is **not** used by the list row (it feeds the grid card and the Home wide card). Proven from a populated row rather than inferred from layer names:

```
Image Wrapper Hero  <-  Image Hero
Image Wrapper 1..4  <-  Image 1 .. Image 4
```

**A matcher trap caught on the way: do not identify a field by "first field whose asset id matches".** `Resorts World` has the **same asset** in `Thumbnail Image - Wide` and `Image Hero` (`EBx8yxrD…jpg`), so a first-match scan reported the Hero slot as bound to `Thumbnail Image - Wide` on that row and to `Image Hero` on Belmont — an apparent contradiction that is purely an artifact. **When two fields can hold the same asset, print the raw ids per field and read them, rather than trusting a reverse lookup.**

**Live state of the three projects (verified in two fresh sessions):**

| SO | item | slug | `Image Hero` + `Image 1-4` | 5th slot (`idiWQDru6`) | result |
|---|---|---|---|---|---|
| 1 | Resorts World | `resorts-world` | **5 of 5 set** | `false` -> 4 slots | **`Image 4` is being HIDDEN** |
| 2 | Belmont Park | `belmont-park` | 4 set (no `Image 4`) | `false` -> 4 slots | correct |
| 3 | **Tuft** | `tuft-barber` | **0 of 5 set** | `true` -> 5 slots | **nothing to render** |

**Tuft's list images are not coming from the CMS — they are baked into the LAST PUBLISHED BUILD.** The four assets the live page shows (`bgspLGF3…`, `ZciU02La…`, `vNKIcS99…`, `8rw9b6TQ…`) exist in **no CMS image field and on no canvas node** in the current document. They were cleared after the last publish. **On the next publish that row renders five empty boxes.**

**This is the inverse of the usual stale-read problem and worth internalising:** the normal trap is a stale *session* contradicting the live site. Here the *published site* is the stale artefact and the document is current. **A rendered page is a snapshot of the last publish, never evidence of present CMS state** — which is why the check was run as "trace the rendered asset back into the CMS" and not "look at the page".

**Cache was ruled out** before concluding: a cache-busted, `no-cache` re-fetch returned the identical four assets, and the page carries each id 18 times in its serialised CMS payload.

**Two things now need a decision:**

1. **Resorts World has gained an `Image 4`** since its 5th slot was switched off on 2026-10-09 — so one of its photographs is currently suppressed. Flip `idiWQDru6` back to `true` on that row.
2. **Tuft needs five list images, or its row needs a different treatment.** Turning its 5th slot off does not help; with zero images it would still render four empty boxes.

**The standing per-row chore this illustrates:** `idiWQDru6` must track each item's actual image count, and **nothing keeps them in sync** — the count drifts the moment anyone edits the CMS, silently and in either direction. `repair/verify-draft-status.js` has a natural companion here; a check that compares each row's slot count against its item's populated image fields would have caught both of these without anyone noticing by eye.

**THE "ERRANT" 4th IMAGE ON EVERY `/projects-list` ROW IS `8rw9b6TQ6N0SMs6AAffGoKALCI.jpg` — A STALE-BUILD ARTEFACT (2026-10-11).** Shak reported extra images and said there should only be three per project.

**It is the SAME asset in slot 4 of all three rows**, which is the tell that it is not CMS data — read from the hydrated DOM, not the HTML source:

| row | slots 1-3 (match the CMS) | slot 4 |
|---|---|---|
| resorts-world | `EBx8yxrD`, `VN0ySMgs`, `JvxnpKIQ` | **`8rw9b6TQ`** |
| belmont-park | `hKitrTjn`, `YiHAIuLB`, `lSdwUzBo` | **`8rw9b6TQ`** |
| tuft-barber | `pSGHfoXan`, `PxKLMSkN`, `sxoArsOU` | **`8rw9b6TQ`** |

**It exists nowhere in the current project.** Not in any CMS image field of any collection; not on any canvas node — a deep probe of **every attribute of all 2,581 `FrameNode`s**, resolving `ImageAsset.url`, found zero references. It is **not** stock-template residue either: the stock Ora site serves it **0** times. And it is confined to one page — `grep` across all nine published pages returns **36 refs on `/projects-list` and 0 everywhere else**, including `/projects-grid`, which renders the same projects through a different component.

**So the document cannot produce it, which means a fresh publish cannot emit it.** Framer builds a page from the document plus CMS; an asset absent from both can only be left over from an earlier build. **The fix is a publish**, not an edit.

**The slot mapping is confirmed by what DOES match:** slots 1-3 on the two populated rows are exactly `Image Hero`, `Image 1`, `Image 2`. The current CMS `Image 3` values (`es1Imfj6` for Resorts World, `TWOrvMZF` for Belmont) appear **nowhere** on the live page — further proof the build predates the present CMS.

**Two vintages are being served from one page, which is why this looked contradictory at first.** The SSR'd HTML gave Tuft `bgspLGF3 / ZciU02La / vNKIcS99 / 8rw9b6TQ`, while the hydrated DOM gave `pSGHfoXan / PxKLMSkN / sxoArsOU / 8rw9b6TQ` — Framer re-renders Collection Lists client-side from separately-published `.framercms` chunks, so **the HTML source and the rendered DOM can disagree**. **Read the hydrated DOM for what a visitor actually sees; the HTML source is only the SSR snapshot.** An earlier conclusion in this file drawn from `curl` alone was right about the row counts but was reading only half the picture.

**On "should only be 3 per project":** the row template has **five** slots (`Image Hero` + `Image 1-4`) and only **one** control — `idiWQDru6`, gating the fifth. There is no way to express "three" with it. **The robust fix is to bind each `Image Wrapper`'s visibility to its own field being non-empty**, so every row renders exactly as many images as it has. That retires the whole class at once: no empty placeholder tiles, no per-row toggle to keep in sync, and no silent drift when the CMS is edited. It is editor work — visibility bindings are not reachable through the node API.

**HOW THE LIST ROW'S FIVE TILES ARE ACTUALLY GATED — read from the editor 2026-10-11, and it is simpler than the earlier note assumed.**

`Projects / List View Row` (`BPcTbqUr_`) has **6 variants** — `Active · Primary`, `Non Active`, `Tablet Active`, `Tablet Non Active`, `Mobile Active`, `Mobile Non Active` — each holding `Stack > Image Wrapper Hero, 1, 2, 3, 4`. **30 wrapper layers in all.** The flat list comes from typing `Image Wrapper` into the layer search; the filtered tree does not reshuffle, unlike expanding nested rows.

**Only ONE of the five is conditional:**

| layer | `Visible` |
|---|---|
| `Image Wrapper Hero`, `1`, `2`, `3` | plain **`Yes / No`** toggle — **no binding, always on** |
| `Image Wrapper 4` | **bound** to the component variable **`5th Image Visible`** (boolean, Default `Yes`) — this is `idiWQDru6` |

**So every row renders at least FOUR tiles no matter what the CMS holds**, and the boolean only ever decides between four and five. **That is the whole explanation for the errant 4th image**: `Image Wrapper 3` always draws, so whatever `Image 3` resolves to is always on screen — including a stale value.

**The component's variables are:** `Hover`, `Link`, `Title`, `Category 1`, `Category 2`, `Image Hero`, `Image 1`, `Image 2`, `Image 3`, `Image 4`, `5th Image Visible`.

**The "bind visibility to the field being non-empty" idea proposed earlier is NOT directly available.** An image variable's editor offers only `Name`, `Description` and a `Default` upload — **there is no `Optional` flag**, which is the thing that would let an empty image drive visibility. `Optional` appears only on the boolean. So that fix would mean adding a boolean per slot and keeping each in step with the CMS by hand — which is the same chore, four times over.

**For a fixed "three images per project" the correct change is much smaller: set `Image Wrapper 3` to `Visible: No`, and `5th Image Visible` to `No`.** Hero + `Image 1` + `Image 2` then render and nothing else can. It also makes the whole class of defect impossible — a stale or stray value in `Image 3` / `Image 4` has nowhere to draw.

**Check all six variants afterwards.** Breakpoint *overrides* are known to cascade from the primary in this project, but these are component **variants**, and the `Active` / `Non Active` pair is a hover state rather than a breakpoint — so do not assume one edit covers all thirty layers. Verify by re-filtering the layer tree and reading each `Image Wrapper 3`.

**Note the CMS keeps its data either way** — `Image 3` and `Image 4` stay populated on Resorts World and Belmont Park, just unrendered, so the decision is reversible.

**APPLIED 2026-10-11 — the list row now shows exactly THREE images per project. NEEDS A PUBLISH.** Both changes were made through the Agent API rather than the editor, which `Image Wrapper 3` allows because **mutating an existing component-internal node works** (only creating and deleting inside a component fails).

| change | scope | result |
|---|---|---|
| `Image Wrapper 3` -> `visible: false` | all **6** variants | 3 were already hidden; 3 were set (`Active`, `Tablet Active`, `Tablet Non Active`) |
| `idiWQDru6` (`5th Image Visible`) -> `false` | all **30** row instances (10 rows x 3 breakpoints) | 6 were `true` and got flipped; the rest already `false` |

**Audit of all 30 wrapper layers:**

```
Active             Hero=vis  1=vis  2=vis  3=HIDDEN  4=vis
Non Active         Hero=vis  1=vis  2=vis  3=HIDDEN  4=vis
Tablet Active      Hero=vis  1=vis  2=vis  3=HIDDEN  4=vis
Tablet Non Active  Hero=vis  1=vis  2=vis  3=HIDDEN  4=vis
Mobile Active      Hero=vis  1=vis  2=vis  3=HIDDEN  4=HIDDEN
Mobile Non Active  Hero=vis  1=vis  2=vis  3=HIDDEN  4=HIDDEN
```

`Image Wrapper 3` hidden **6/6**; the only other hidden wrappers are `Image Wrapper 4` on the two **Mobile** variants, which was pre-existing. **Row instances: 30, with the fifth image still on: 0.**

**So every breakpoint lands on three tiles, by two different routes** — desktop and tablet keep `Image Wrapper 4` *visible* but gated off by the boolean, while mobile hides it outright. Worth knowing, because **turning the boolean back on would restore a fourth tile on desktop and tablet but NOT on mobile**.

**Three of the six variants already had `Image Wrapper 3` hidden** (`Non Active`, `Mobile Active`, `Mobile Non Active`) — which corrects the earlier reading that all five wrappers were unconditionally visible. `Non Active` is the **resting** state, so the fourth tile a visitor saw was `Image Wrapper 4`, not 3. The conclusion was right, the slot attribution was not. **A panel reading taken on one variant does not describe the others; read all of them.**

**Confirmed in two independent fresh sessions**, which both returned the table above byte for byte. A third attempt in between died with *“Connection to the Framer server was lost”* — **a dropped relay is not a disagreeing read**, and must not be counted as one of the two agreeing confirmations in either direction. Re-run it.

**The CMS is untouched** — `Image 3` and `Image 4` remain populated on Resorts World and Belmont Park, simply unrendered, so this is reversible without data loss.

**This also permanently closes the stale-image defect**: with slots 4 and 5 unable to draw, a stray or stale value in those fields has nowhere to appear.

**A caution for the walker:** finding these instances needs a traversal depth of **at least 7** — `Page > Breakpoint > Main > Section Projects > Container > Projects List > Projects > instance`. An earlier pass capped at `d < 6`, found nothing, and returned a confident empty result. **A depth-limited walk that finds nothing is not evidence of absence.**

### The empty container on a project detail page — do NOT delete it (2026-10-11)

Shak reported an empty striped block on the project pages, below the hero and the two side-by-side images, and asked for it to be deleted. **Deleting it would be the wrong fix and would cost real content.**

**The detail template's image blocks, read from the live DOM of `/projects/belmont-park`:**

| block | binds to | Belmont |
|---|---|---|
| `Image Hero` (1036x806) | `Image Hero` | `hKitrTjn` |
| `Image Duo Wrapper` -> 2x `Image Wrapper 3x4` (496x660 each) | `Image 1`, `Image 2` | `YiHAIuLB`, `lSdwUzBo` |
| **`Image Wrapper 16x9` (1006x566)** | `Image 4` | **empty — the reported block** |

**FRAMER ALREADY OMITS THESE CONTAINERS WHEN THE FIELD IS EMPTY, and `tuft-barber` proves it.** Container counts across the three published pages:

| page | `Image Hero` | `Image Wrapper 3x4` | `Image Wrapper 16x9` |
|---|---|---|---|
| resorts-world | 1 | 2 | **1, with an image** |
| belmont-park | 1 | 2 | **1, empty** |
| **tuft-barber** | **0** | **0** | **0** |

Tuft has no image fields set at all and its containers are **absent from the markup entirely** — not present-and-blank. So the template is already conditional; an empty field normally produces no container.

**Which means Belmont's empty block is almost certainly another stale-build artefact** — the same class as the `/projects-list` images. `Image 4` was cleared on Belmont after the last publish, so the published HTML still carries the container while the asset behind it is gone. **A publish should make it disappear by itself.**

**Deleting `Image Wrapper 16x9` from the template would remove Resorts World's fourth image**, which is genuinely present (`DP8GLV2R…jpg`). One project's missing content is not a reason to delete a slot the other projects use.

**So the order is: publish, then look again.** If the block survives a fresh publish, it is a real template fault and worth fixing then — but not before, and not by deletion.

**Note the published page and the CMS disagree on Resorts World too:** the page serves `DP8GLV2R…jpg` in that slot while the CMS has `fLGXAp7C…jpg` in `Image 4`. More of the same staleness, and another reason to publish before diagnosing anything on these pages.

**THE 16x9 BLOCK IS HIDDEN, NOT DELETED — `remove()` SILENTLY FAILED (2026-10-11).** Shak reaffirmed the request after being shown the cost, so it was carried out.

**`Image Wrapper 16x9` exists three times** on `/projects/:slug`, one per breakpoint — `yL2ZxuOn2` (Desktop), `E0qmMgmpWyL2ZxuOn2` (Tablet), `ZgcpmiHckyL2ZxuOn2` (Phone), all at `Main > Container Relative > Section Images`.

**Deletion is not possible through the API here, and it fails DISHONESTLY:**

- `framer.removeNodes([ids])` — no effect. `framer.getNode(id)` returns **null** for all three, so the ids are not addressable.
- `node.remove()` on **live handles obtained by traversal** returned **`ok` for all three** — and **two fresh sessions both showed all three still present.**

So `remove()` joins the silent-failure family (`ImageAsset` literals, gradient literals, the `variant` control). The tell is the same as the orphan variant `hLYcAEbg2`: **`removeNodes` does not reach inside a `ComponentNode`**, and `getParent` returning `null` for these nodes was the early clue that they are component-internal despite the page-looking path.

**`setAttributes({ visible: false })` worked first time on all three** and verified in two fresh sessions — consistent with the standing rule that **mutating** an existing component-internal node works where **creating or deleting** one does not.

**Net effect is identical on the published page** (a hidden layer emits no markup) and it is **reversible**, which a deletion would not have been. **If a true deletion is ever wanted it must be done by hand in the editor.**

**The pre-deletion state is recorded at [repair/deleted-image-wrapper-16x9.json](repair/deleted-image-wrapper-16x9.json)** — all three nodes with full attributes (`position: absolute`, `top: 798px`, `centerX: 50%`, `width: 1fr`, `height: 674.5px`, `aspectRatio: 1.778`, `borderRadius: 10px`, `overflow: hidden`, horizontal centred stack, `gap: 10px`, one child named `Image`), so the block can be rebuilt if the decision is revisited.

**Known cost, accepted by Shak after it was raised:** Resorts World has a real photograph in this slot (`DP8GLV2R…jpg` on the published page) and will now lose it on all three breakpoints. Belmont Park and Tuft had nothing there.

**A capture trap worth avoiding:** the first attempt to record the pre-state piped the `exec` output through `tail -60`, which **silently truncated the JSON to the last node only** — the restore record would have covered Phone and lost Desktop and Tablet. **Write an `exec` dump straight to a file and count the entries before trusting it as a backup.**

**`Section Details` REMOVED FROM THE PROJECT PAGES (hidden, 2026-10-11) — and this is the case that BREAKS the "two fresh sessions agree" rule.**

Shak asked for the About / Client / Category / Year block to go. It is **`Section Details`** (`IWwCV5Xkt`) under `Main > Container Relative`, holding `Left Content > Text Wrapper` (About) and `Right Content > Details` (Client, Category, Year). Hidden on all three breakpoints — `IWwCV5Xkt`, `E0qmMgmpWIWwCV5Xkt`, `ZgcpmiHckIWwCV5Xkt`.

**Nothing was lost, unlike the 16x9 block.** All five fields are **empty on all three live projects** — `About`, `Client`, `Category 1`, `Category 2`, `Year`. The stray comma visible in the rendered page was the category separator with nothing on either side. So this removal has no content cost at all.

**!!! TWO AGREEING FRESH SESSIONS WERE BOTH STALE — the verification standard used throughout this project is not sufficient !!!**

The write reported success. **Two brand-new sessions, created after it, BOTH reported `visible=true`.** By the rule recorded in this file ("re-read until two reads agree") that is a confirmed failure, and it was nearly written up as one.

It was not. Re-running the **write** from a third fresh session reported **`already hidden` for all three** — meaning the original write had applied all along — and two further fresh sessions then read `visible=false`.

**So the file's existing note is too weak.** It says a single fresh session can be stale and recommends reading until two agree. In fact **two independent fresh sessions can agree on the same stale value**, which makes agreement alone worthless as proof.

**The stronger check is to RE-ISSUE THE WRITE and read its own report of the prior state.** A write that answers `already hidden` / `already false` is evidence from the document it is about to modify, not from a possibly-stale snapshot — and it is idempotent, so it costs nothing. **Prefer "re-run the write and see if it says it was already done" over "read it twice".**

Where a published page can be consulted, that remains the best evidence of all; but for an unpublished change there is no page to read, which is exactly when this trap bites.

**THE SPACER THAT VANISHED WITH `Section Details`, AND HOW IT WAS RESTORED (2026-10-11).** Hiding the section collapsed the gap between the sticky hero and the image duo — the hero ran straight into the photographs.

**All the vertical separation lived in `Section Details`' own padding.** `Container Relative` is a vertical stack with **`gap: 0px`** and no padding, and `Section Images` carried **`padding: 0px 15px 0px 15px`** — no top or bottom at all. It was sandwiched, taking its spacing entirely from the sections either side:

| | `Section Details` padding (t r b l) | `Section Quote` |
|---|---|---|
| Desktop / Tablet | `50px 15px 90px 15px` | `30px 15px 120px 15px` |
| Phone | `30px 15px 60px 15px` | `30px 15px 120px 15px` |

**Fix: give `Section Images` the top padding that used to sit above it** — `90px` on Desktop and Tablet, `60px` on Phone, matching the bottom padding `Section Details` contributed, and staying inside the design's existing 30/50/60/90/120 vocabulary. Final: `90px 15px 0px 15px` / `90px…` / `60px 15px 0px 15px`. **One value to tune if the gap reads wrong.**

**This generalises: a layer whose neighbours supply all its spacing becomes a spacing bug the moment one of them is hidden.** Before hiding any section in a zero-gap stack, read its padding and check whether a sibling depends on it.

**!!! A WRITE'S REPORT OF THE PRIOR VALUE CAN ITSELF BE STALE — this narrows the rule recorded immediately above !!!**

The previous note proposed re-issuing a write and trusting what it says about the prior state. **That is not reliable either.** Three separate fresh sessions each reported `Desktop: 0px 15px 0px 15px -> 90px…`, as though the value kept reverting. It had not: a **separate `exec` on the same session**, run straight after the write, read `90px` on all three breakpoints, and two further fresh sessions confirmed it.

**What was actually happening: a fresh session opens on a stale snapshot, and the write's prior-value report is computed from that snapshot** — so it can describe a state that is already out of date, while the write itself lands correctly against the live document.

**The reliable pattern, which survives all of today's failures:**

1. do the write,
2. **read back in a SEPARATE `exec` on the SAME session** — this consistently told the truth, both here and for `Section Details`,
3. and treat the first read of any brand-new session as suspect; discard it and read again.

Writes are idempotent here, so a repeat costs nothing — but **do not read the repeat's "prior value" as evidence of anything.**

**`Section Details` RESTORED, and the spacing patch reverted with it (2026-10-11).** Shak asked for the About / Client / Category / Year block back, showing the stock Ora rendering of it (Polestar, fully populated) as the reference.

Both halves were undone together, which matters: `Section Details` -> `visible: true` **and** `Section Images` padding back to **`0px 15px 0px 15px`** on all three breakpoints. **Leaving the 90/60px top padding in place would have double-counted the gap**, since `Section Details` supplies `90px` / `60px` of bottom padding itself. **Whenever a hidden section is restored, revert whatever was added to compensate for hiding it** — the compensation and the cause are a pair.

**Verified by the pattern that has proven reliable here:** write, then read back in a **separate `exec` on the same session** — `visible=true` and `padding=0px 15px 0px 15px` on Desktop, Tablet and Phone.

**Padding and visibility both cascade from Desktop**, visible in the write log: setting Desktop reported Tablet and Phone as "already" correct for `Section Details`, while `Section Images` still needed Phone written explicitly because it had carried a distinct `60px`. **Write every breakpoint anyway and read all three back** — the cascade is real but not uniform.

**The section will render with labels and no values** until content is added: `About`, `Client`, `Category 1`, `Category 2` and `Year` are **empty on all three live projects**. That is the state Shak photographed earlier, with the stray comma between the two empty category fields. The stock template screenshot he supplied is Ora's own Polestar copy, not Alkimi content.

**Still hidden and NOT restored by this change: `Image Wrapper 16x9`** on all three breakpoints — the separate deletion request. Resorts World's fourth photograph remains suppressed. [repair/deleted-image-wrapper-16x9.json](repair/deleted-image-wrapper-16x9.json) holds its pre-change state if that one is also to be reversed.

**`Section Quote` REMOVED (hidden), WITH ITS SPACING TRANSFERRED (2026-10-11).** Shak asked for the quote block at the foot of the project pages to go — on the live pages it was a tall band of empty white between the image duo and the "Lighting options" heading.

**It was empty on every live project.** `Quote` and `Quote Author` hold nothing on Resorts World, Belmont Park or Tuft — note the first two read as *blank rather than null*, i.e. empty rich text (`<p></p>`), which still renders a block. **An empty `formattedText` field is not the same as an unset one, and only the latter makes Framer omit the layer.**

**It carried 150px of vertical padding** — `30px 15px 120px 15px` — while **neither neighbour has any**: `Section Images` was `0px 15px 0px 15px` and `Next Projects Heading` is `0px 15px 50px 15px`, with no top padding. Hiding it alone would have slammed the photographs into the heading, the same collapse that followed hiding `Section Details`.

**So both were done in one pass:** `Section Quote` -> `visible: false`, and `Section Images` padding -> **`0px 15px 120px 15px`** on all three breakpoints, taking over the `120px` the quote section used to place below itself. **That bottom value is the single knob if the gap reads wrong.**

**This is now the third time a hidden section has taken a sibling's spacing with it** (`Section Details`, then its restore, now `Section Quote`). **Treat it as the default expectation in `Container Relative`, which is a `gap: 0` stack where every section supplies its own padding and `Section Images` supplies none.** Before hiding anything there, read the padding of the layer above and below, and move the value rather than deleting it.

**Current state of `Section Images` padding is doing two jobs** — `0px` top because `Section Details` is visible again and pads below itself, `120px` bottom because `Section Quote` is hidden and no longer does. **If `Section Quote` is ever restored, that bottom `120px` must go back to `0px`**, exactly as the top padding did when `Section Details` came back.

**ALL FIVE CHANGES PUBLISHED AND VERIFIED LIVE 2026-10-11.**

| change | verified on the served page |
|---|---|
| `/projects-list` cut to three images | **3 wrappers / 3 images on every row** |
| the stale `8rw9b6TQ` tile | **0 references** — the publish cleared it, as predicted |
| Home wide card on the Home collection | `YiHAIuLB…jpg` present (12 srcset refs) |
| `Image Wrapper 16x9` hidden | **0** on all three project pages |
| `Section Details` restored / `Section Quote` hidden | **Details 1, Quote 0** on all three |

`Section Images`' replacement spacing ships as **`padding:0 15px 120px`** — Framer normalises `0px` to `0` and drops the redundant fourth value, so **grepping the published CSS for the exact string that was written finds nothing**. Match on the number, not the literal. Full Home regression sweep passes on all ten checks.

**CORRECTION — "Tuft has no list images" was WRONG, and it was asserted twice.** Tuft now reads `Image Hero = pSGHfoXan…`, `Image 1 = sxoArsOU…`, `Image 2 = PxKLMSkN…`, and its row renders three images correctly. An earlier read reported all five slots empty with only `Thumbnail Image - Wide` set, and on that basis Shak was warned twice that his row would publish blank.

**The hydrated DOM had already contradicted that at the time** — it showed exactly `pSGHfoXan / sxoArsOU / PxKLMSkN` for `tuft-barber` — and that contradiction was explained away as a stale build rather than treated as evidence against the CMS read. **It is not possible to tell now whether Shak populated the fields after the warning or the read was stale all along**, but the second possibility can no longer be dismissed, because today established that **two agreeing fresh sessions can both serve stale data**.

**The lesson is about which source wins.** When a CMS read and the rendered page disagree, the instinct used here was "the document is current, the page is stale". That is sometimes true — the `8rw9b6TQ` tile really was stale build output — but **it is not a rule, and it was applied as one.** Where a published page shows *more* data than the document, suspect the read before announcing missing content, and never warn a user that their content is absent on the strength of an API read alone.

### Project image parity audit — format is perfect, geometry is not (2026-10-11)

All nine distinct images across the three live projects, measured in the browser.

**FORMAT AND QUALITY: FULL PARITY, nothing to do.** Every one is **JPEG**, every CMS field is **`resolution: auto`**, and every master is unquantised — **36,451 to 107,983 distinct tones**. No PNGs, no palette damage, no `lossless=1`. Encoding density is consistent at **117-254 KB/megapixel**.

**All three projects now share the same shape** — `Thumbnail Image - Wide` and `Image Hero` holding the *same* asset, plus `Image 1` and `Image 2`. `Image 3` and `Image 4` are empty everywhere, which is consistent with the three-image list rows.

**MASTER SIZE: tight within two projects, wild in the third.**

| project | masters | megapixels |
|---|---|---|
| Resorts World | `2560x1706`, **`739x415`**, `2048x1152` | 4.37 / **0.31** / 2.36 |
| Belmont Park | `1860x1059`, `1860x1060`, `1860x1045` | 1.97 / 1.97 / 1.94 |
| Tuft | `3000x2250` x3 | 6.75 x3 |

**`DP8GLV2RXznTN4Ho158UxpeJa4.jpg` (Resorts World `Image 1`) is a 14x outlier against its own hero** and the only genuinely deficient master on the site.

**ASPECT RATIO: three different conventions.** Resorts World hero **1.50 (3:2)** with its pair at **1.78 (16:9)**; Belmont all **~1.76 (16:9)**; Tuft all **1.333 (4:3)**.

**THE REAL DEFECT, AND IT AFFECTS EVERY PROJECT: `Image Wrapper 3x4` is PORTRAIT and every asset is LANDSCAPE.** The box needs **`743x991` device px** at `dpr 1.5`. Under `object-fit: cover` a landscape image must scale until it fills the *height*, so measured cover-scales are:

| project | duo image 1 | duo image 2 |
|---|---|---|
| Resorts World | **2.39x** (`DP8GLV2R`, master only 415 tall) | **1.72x** |
| Belmont Park | **1.70x** | **1.72x** |
| Tuft | **1.29x** | **1.29x** |

Tuft fares best only because 4:3 is closer to portrait than 16:9. **Every duo image on the site is being upscaled**, and roughly 55-60% of each image's width is cropped away.

**AND IT IS MOSTLY A DELIVERY FAULT, NOT A MASTER FAULT — this is the part worth knowing.** Tuft's masters are `3000x2250`, yet the browser pulled the **`1024`-wide** candidate and then upscaled it 1.29x. The `2048` candidate exists and would have given a cover-scale of **0.65**. The cause: **`sizes` is computed from the box's WIDTH only** (496 CSS px -> 744 device px -> pick >= 744 -> 1024), so it has no idea the image will be cropped vertically and needs far more pixels. **A landscape image in a portrait `cover` box is systematically under-served by `srcset`, however large the master is.**

**So there are two separate problems and they need different fixes:**

1. **Supply portrait crops (3:4) for the duo, or make the box landscape.** This removes the upscaling *and* the heavy cropping at a stroke, and it is the only fix that works through `srcset` rather than against it.
2. **Replace `DP8GLV2R`** — at `739x415` no delivery choice can help it. New artwork only.

Heroes are fine and need nothing: cover-scales of **0.89** (Resorts World), **1.14** (Belmont), **0.79** (Tuft) into a `1554x1209` box.

### Removing the "X min read" — it lives in TWO places, and one of them hides the date too (2026-10-11)

**It is NOT one layer and it is NOT the CMS field.** There are two independent renderings:

| where | layer | scope |
|---|---|---|
| article **cards** (Home newsroom, `/news` listing, related articles) | `News / News Article` -> `Container > Details > Stack > `**`Time Read`** | **6 variants** |
| the article **hero** on `/news/:slug` | `Section Hero > Heading > Add On > Time Wrapper > Time read` | **3 breakpoints** |

**On the card, the circled arrow is INSIDE `Time Read`** — the wrapper holds `Arrow Wrapper` plus the `2 min read` text — so hiding the wrapper removes the arrow and the text together, which is how the two read visually. Hiding one variant **cascaded to the other five**.

**On the hero it is the opposite: hiding the wrapper would have destroyed the date.** `Time read` contains **three** children — `6 min read`, a `|` separator, and `December, 27th 2024`. Only the first two were hidden; the date is preserved on all three breakpoints. **Always enumerate a wrapper's children before hiding it by name** — "Time read" sounds like it holds the read time and nothing else.

**CLEARING THE CMS FIELD WOULD NOT HAVE WORKED, and the proof was already on the site.** News carries a **`Time Read` [string]** field, and the obvious fix is to blank it. But the live article *"A fresh depth of color"* already has `Time Read = ""` **and its card still renders "2 min read"** — the layer's design-time text. **An empty string falls back to the placeholder rather than rendering nothing**, so emptying the field would have left a wrong, fixed "2 min read" on every card. The CMS values are untouched and still hold `4 min read` / `5 min read` etc., so this is reversible.

**A related reading trap:** the published `/news` shows **"2 min read" on all three cards** while the CMS holds `""`, `"4 min read"` and `"5 min read"`. That is the same placeholder fallback, not three identical articles — **a repeated value across rows is the signature of a design-time default, exactly as the repeated `8rw9b6TQ` tile was.**

**Scanning note:** a full `getText` walk over every page and component did not finish in two minutes and had to be killed. **Searching by layer NAME is far cheaper than reading text**, and works here because Framer names a text layer after its content — `2 min read`, `6 min read`, `December, 27th 2024`.

**PUBLISHED AND VERIFIED 2026-10-11 — the read-time is gone from every surface, and the date survived.**

| page | rendered read-times | notes |
|---|---|---|
| `/` (Home newsroom) | **0** | 4 visible arrows remain, all the **"All Articles"** section link counted at nested levels — **no orphaned card arrows** |
| `/news` | **0** | |
| `/news/cauda` | **0** | date **"May 2026"** still visible, **0** stray `\|` separators |

**A GREP OF THE PUBLISHED HTML SAYS IT IS STILL THERE, AND THAT IS A FALSE POSITIVE.** `curl \| grep "min read"` returns **2-6 hits per page** after the change. Every one is the **serialised CMS payload** Framer ships at the end of the page — the `Time Read` field values, which remain populated by design. **Counting the string in the markup cannot distinguish data from rendering.**

**The check that actually answers it** is to walk the DOM for *leaf* elements whose text matches, and keep only those with a non-zero box and no `display:none` / `visibility:hidden` / `opacity:0`:

```js
[...document.querySelectorAll('*')].filter(e => !e.children.length
  && /min read/i.test(e.textContent || '')
  && e.getBoundingClientRect().width > 0
  && getComputedStyle(e).visibility !== 'hidden')
```

This is the same family as the earlier `<img>`-count rule — **asset URLs and field strings reach the page whether or not anything renders them** — and it applies to *any* removal of CMS-bound text here. **Verify a hide by what paints, never by what the markup contains.**

**Checking for orphans is part of verifying a hide.** Hiding `Time Read` also removed the circled arrow nested inside it; confirming that no lone arrow was left behind needed a separate query, because a stranded sibling would not show up in any search for the text that was removed.

### Video hero for news articles — fields added, the layer needs the editor (2026-10-11)

Shak asked whether a news article's hero could be an MP4 instead of an image. **Yes, and the project already contains a working implementation to copy.**

**The Projects pages do this with `Projects CMS Page / Hero Image - Video Projects Page` (`VxWZXGISB`).** Its `Image / Video Wrapper` holds **both** an `Image Hero` layer and a `Video Hero` layer, plus an `Overlay`. **Both read `visible: false` in the stored canvas** — their visibility is *conditionally bound* to which CMS field is populated, and the node API reports the stored value rather than the binding, so **do not read `visible: false` here as "switched off"**. It is driven by `Hero Video URL` [string] and `Hero Video -  Poster` [image].

**Working `Video Hero` control values, worth copying verbatim:**

```json
{ "srcType": "URL", "playing": true, "loop": true, "muted": true, "volume": 25,
  "objectFit": "cover", "controls": false, "posterEnabled": true,
  "startTime": 0, "backgroundColor": "rgba(0, 0, 0, 0)" }
```

**The News hero is much simpler** — `Section Hero > Image Wrapper > Thumbnail`, a single image layer, with no video path at all.

**DONE (scripted): two fields added to the News collection** on Shak's choice of "both" —

| field | type | id |
|---|---|---|
| `Hero Video` | **file**, `allowedFileTypes: ["mp4","mov","webm"]` | `qfoKFNjzV` |
| `Hero Video - Poster` | **image** | `Ux2PVfH50` |

A **file** field was chosen over the Projects `[string]` URL because News already uses one for `Thumbnail Video MOV`, so it matches the existing workflow — drop an MP4 into the cell. `Collection.addFields` works in this scope and is additive; verified in a separate `exec`.

**STILL NEEDED, AND IT CANNOT BE SCRIPTED: the `Video` layer itself.** It has to be created inside `/news/:slug` -> `Section Hero > Image Wrapper`, and **that page is published**, so `createFrameNode` / `addComponentInstance` will ignore the `parentId` and drop the node on the **Home** page instead. This is the documented draft-pages-only limit. In the editor: add a Video layer beside `Thumbnail`, point its source at `Hero Video`, its poster at `Hero Video - Poster`, copy the control values above, and make the two layers' visibility conditional so the image shows when no video is set.

**Note the inherited oddity:** the News hero's image layer is named **`Thumbnail`**, which suggests it may bind the `Thumbnail` field rather than `Image Hero` — worth checking while in there, since Shak's question assumed `Image Hero` drives it.

**RESOLVED: the News hero binds `Image Hero`, not `Thumbnail`.** The previous note flagged this as uncertain because the layer is *named* `Thumbnail`. Read from the panel: its **`Fill` is bound to `Image Hero`**, set to `Fill` with a `Focal point`. Another stale Ora name — **add `Thumbnail` (the News hero layer) to the list of template names that lie**, alongside `News` for the "Lighting options" heading and `About us` for "Case Studies".

**Exact location, confirmed in the editor:** `/news/:slug` -> `Desktop > Main > Section Hero > Image Wrapper > Thumbnail`. The wrapper carries the canvas badge **`News Image Hero`**, which is the name worth searching for. Siblings of `Section Hero` are `Section Article` and `Section News`.

**To finish the video hero, in the editor:** add a `Video` layer as a **sibling of `Thumbnail` inside `Image Wrapper`**, bind its source to the new **`Hero Video`** file field and its poster to **`Hero Video - Poster`**, copy the control values from the Projects hero, and make the two layers' visibility conditional so the image shows when no video is set.

**EDITOR-DRIVING NOTES FROM THIS PASS, all cheap to repeat:**

- **A layer-level deep link does NOT work, even for a plain page layer.** `?node=LkP9Ievq3` (the `Thumbnail` node, not component-internal) silently fell back to `?node=<pageId>&item=<cmsItemId>`. **Only page and component ids resolve** — the earlier note said component-internal ids fail, and this widens it to *all* layer ids.
- **The layer-tree search box did not hold its filter** — typing `Image Wrapper` into it listed only the three breakpoints, and the filter cleared on the next expand. **Walking the tree by name is more reliable than filtering it**, contrary to the standing note that filtering gives a flat stable list; that advice holds inside a *component*, not on a CMS page.
- **One script can do the whole walk** if it `await`s between steps: click `Layers`, then for each of `Main`, `Section Hero`, `Image Wrapper` find the row by text and click the disclosure arrow at `row.x - 16`, sleeping ~700ms between, then select the leaf. This avoided five separate round trips and the usual re-render races.
- **`Page.captureScreenshot` timed out again** on this page while JavaScript kept running — the documented canvas freeze. **Read the DOM to confirm state when a screenshot fails**; do not assume the action did not land.

**A CMS BINDING IS NEITHER READABLE NOR WRITABLE — so "build the layer by script on a draft page" CANNOT finish a CMS-bound layer (established 2026-10-11).**

Offered to flip `/news/:slug` to `draft: true` so the Video hero layer could be created by script, since `parentId` is honoured on draft pages. **Checked before taking the risk, and the plan does not work.**

`Thumbnail` on the News hero visibly renders `Image Hero` — the panel shows `Fill -> Image Hero`. Yet a dump of **every** attribute on that node shows **no `backgroundImage` at all**, and a search across all its serialised attributes for both the field name and its id (`fzKguB9Z3`) returns **nothing**:

```
id, __class, name, visible, locked, rotation, opacity, position, top,
centerX, width, height, overflow, gridItemFill*, isVariant, isBreakpoint…
```

**The binding is not stored in any attribute the API exposes.** That matches the conditional-visibility bindings on the projects list row and the Projects hero, and it generalises: **the Agent API can create and style a node, but cannot connect it to CMS data.** A scripted layer could only carry a *literal* value — one hard-coded video URL on every article, which is worse than not building it.

**So the draft-flip was withdrawn before being used.** The risk was real — while `/news/:slug` is a draft, any publish removes every news article from the site — and it would have bought a layer that cannot do its job. **Verify that a risky route can actually reach the goal before taking the risk, not after.**

**The correct route is the editor, and the cheapest version is to copy the working layer rather than build one:** open `Projects CMS Page / Hero Image - Video Projects Page`, copy its `Video Hero` out of `Image / Video Wrapper`, and paste it beside `Thumbnail` in the News `Section Hero > Image Wrapper`. That carries the tuned controls across; only the source, poster and visibility bindings then need repointing at the News fields, and those are exactly the parts that must be done by hand anyway.

**Match `Thumbnail`'s geometry when pasting:** `position: absolute`, `top: 0px`, `centerX: 50%`, `width: 100%`, `height: 100%`, `overflow: hidden`.

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
- **Framer's APPEAR and SCROLL effects do not run in a hidden/unfocused tab — but hover and variant interactions DO (corrected 2026-10-05; see the Claude in Chrome section).** The original blanket wording said no effects ran at all, and that is wrong. Any tab driven by automation reports `document.visibilityState === "hidden"` and `document.hasFocus() === false`, and in that state Framer runs **neither appear animations nor scroll/variant effects**. Consequences, both of which wasted hours on 2026-10-01:
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

## Visual access to the published site — use Claude in Chrome, not the built-in browser pane (established 2026-10-05)

The built-in browser pane is **useless for this project**. It reports `document.visibilityState === "hidden"`, `hasFocus() === false` and — the killer — an `innerWidth`/`innerHeight` of **0 x 0**, so every `getBoundingClientRect` is degenerate and screenshots show nothing meaningful. The pane cannot be un-hidden programmatically (`show_pane` has no browser option).

**Claude in Chrome drives the user's real Chrome and works.** Measured there on 2026-10-05: real viewport `1536 x 855`, `devicePixelRatio` 1.5, real screenshots, and **real pointer events via `computer` `hover`**.

**What works even while the Chrome tab is BACKGROUNDED (`visibilityState: "hidden"`):**

- Full-page rendering and screenshots — content paints normally, it is not stuck at `opacity: 0.001`.
- Correct geometry from `getBoundingClientRect`.
- **Hover and variant switching.** A real `computer` `hover` drove the row through `framer-v-1juo821` -> `framer-v-1dlme80` -> `framer-v-1rizoid` and the cards resized. **This contradicts the older blanket claim that Framer effects never run in a hidden tab** — variant interactions clearly do.

**What does NOT work while backgrounded:**

- **`requestAnimationFrame` is frozen, not merely throttled.** A rAF sampling loop collected **4 samples in 2500 ms**, and a loop that awaited 1 second of frames never resolved at all (the CDP `Runtime.evaluate` hit its 45-second timeout). So **end states are measurable, transitions are not.** Anything that needs intermediate animation frames requires the user to bring that Chrome tab to the front and leave it visible.

**Two gotchas when driving it:**

- **Check which tab you are about to navigate.** `navigate` without an explicit `tabId` grabs the group's first tab — on 2026-10-05 that was Shak's open **Framer editor**, which got navigated away and had to be restored. Call `tabs_context_mcp` first and pass an explicit `tabId`.
- The screenshot coordinate frame is **1459 x 812** while CSS is **1536 x 855** — multiply CSS coordinates by about **0.95** before passing them to `computer`. Read geometry via JS, convert, then hover.

**Confirmed by real hover on the published site, 2026-10-05** (scroll to ~870, hover the left card):

| | Left (Fixtures) | Right (Elements) |
|---|---|---|
| resting | 745 x 761.11 | 745 x 761.11 |
| hovered (`framer-v-1rizoid`) | 894 x 761.11 | 596 x 761.11 |
| radius, hovered | **10px** | 10px |

Gap held at exactly **16** at rest (760 -> 776), hovered (909 -> 925), **and in the one mid-animation sample captured** (776.56 -> 792.56). Card heights were identical in every state. The left card's hovered radius of `10px` is the 2026-10-05 fix confirmed live.

**The documented `Reset` behaviour is real and will fool you.** At scroll ~870 the row sits in `Before Scroll State - Below Hero`, where Mouse enter is `Reset...`. The first hover does **not** open a card — it resets the component to its base variant. Hover again and it opens properly. Observed exactly as the note predicts.

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
| `Home - Projects Row` | rotates whenever the component is edited (`framer-FHOjC` -> `framer-9dkxz` on 2026-10-05) | the two-up **Fixtures / Elements** cards |
| `Home - Projects Row 2` | rotates likewise (`framer-D4P7g` -> `framer-8Ouu1` -> `framer-atzSa`) | the full-width **case-study** card (`Home Project Single - Wide`) |

**Do not use these hash values as identifiers — an earlier note called `framer-FHOjC` stable for Row 1, and that was wrong.** A component's 5-character hash changes when the component itself is edited, not merely every publish: the 2026-10-05 radius fix touched both components and rotated both hashes in the same build. The *method* still works — walk up from a `Product Card` to the ancestor carrying a 5-character `framer-XXXXX` class, and two different hashes means two different components — but read the values live each time rather than matching the ones written here.

Both live in Assets -> Project (`Row 2` sits at the top level, not inside the `Home` folder) and **both carry the same nine variant names** — `Home Projects - Initial State`, `… Left Open`, `… Right Open`, `Before Scroll State - Below Hero`, `Home Project Single - Wide`, `… Tablet`, `… Mobile`, `Home Project Single Wide - Mobile`, `… Tablet Below Hero`. Identical layer trees inside. It is very easy to edit one, verify the live page, and conclude the job is done.

**How to tell them apart on the published page:** walk up from a `Product Card` to the ancestor carrying a 5-character `framer-XXXXX` class. Two different hashes means two different components. Do not match on the variant name — both use the same names.

In both components the gap pattern was identical: the base variant at 15 **not** overridden, and `Left Open` / `Right Open` each carrying their own purple 15. Both were set to 16, and both `Product Card` radii to 10, on 2026-10-02.
**Row gap is 16, not 15, and it must stay even (changed 2026-10-02).** A faint vertical line was visible in the gutter between the two cards. It is not an element — the gutter contains no DOM at all. It was **sub-pixel antialiasing**: at `devicePixelRatio` 1.5 the inner edges landed on fractional device pixels and the browser blended them.

```
gap 15 :  card 745.5   left edge 760.5 -> 1140.75 device px   right edge 775.5 -> 1163.25   both blurred
gap 16 :  card 745     left edge 760   -> 1140    device px   right edge 776   -> 1164      both exact
```

**An odd gap can never satisfy both edges at once.** Solving for whole device pixels at 1.5 dpr: with gap 15 the left edge needs `viewport = 3 (mod 4)` and the right edge needs `viewport = 1 (mod 4)` — contradictory, so at *every* viewport width one of the two inner edges is blurred, and which one flips as you resize. With gap 16 both edges need `viewport = 0 (mod 4)`, i.e. they share a phase. This is the same even/odd trap as the menu dividers, on the horizontal axis.

**Set the gap on EVERY variant, not just the base — that is 9 per component, 18 in total.** An earlier version of this note said "all four", which would under-apply any future change. `Home Projects Left Open` and `Home Projects - Right Open` each carry their own override, and leaving those behind makes the gap *animate* between two values on hover, shifting both inner edges mid-transition — worse than the original seam. Audited 2026-10-05 through the Agent CLI: **18/18 at 16px**.

**16 is not special — the rule is "even", and the value is settable.** The two inner edges sit at `(W - gap)/2` and `(W + gap)/2`; at `devicePixelRatio` 1.5 each is crisp only when its offset x 1.5 is a whole device pixel, needing `W - gap = 0 (mod 4)` *and* `W + gap = 0 (mod 4)`. Subtracting gives `2 x gap = 0 (mod 4)`, so an **odd gap makes the two conditions contradictory** — at every viewport one edge is blurred and which one flips as you resize. With an even gap they collapse to a single condition and the edges share a phase. So 12, 14, 18, 20, 24 all behave identically to 16; 15 or 17 bring the defect straight back. **Changing it also moves the card height**, because width is `(W - gap)/2` and height follows through the `1.17458` ratio — re-measure and update the 761.11 baseline if you ever do. **Asked and confirmed to leave at 16 on 2026-10-05.**

The hover states still land on half-device-pixels (`909 -> 1363.5`), which is a uniform 50% blend rather than the old asymmetric 0.75/0.25 — better, but intermediate widths during an animation are fractional by nature and cannot be made exact. Whether this is what caused the reported "narrowing on the inner edge while the hover settles" is **unconfirmed** — it is a measured sub-pixel defect at exactly the right location, but the animation itself still cannot be observed from an automated tab.
**Card corner radius — a deliberate divergence from stock (2026-10-02, completed 2026-10-05).** Stock Ora ships the left card's `Product Card` at **`border-radius: 0`** while the right card's is **`10px`**, so the left card has square corners sandwiched between a rounded `Project Left` (10px) parent and a rounded `Image Wrapper Left` (10px) child. It reads as a template oversight, not a design choice. **We set the left `Product Card` to `10px`** on both row components so every card matches. Our site intentionally differs from stock here — **do not "restore" it to 0**.

**The 2026-10-02 note claimed the base-variant edit "cascades to the hover and breakpoint variants". It does not — that was wrong, and it left a real defect live for three days.** A direct canvas audit on 2026-10-05 (all 9 variants x both components, read through the Agent CLI) found **`Home Projects Left Open` carrying its own override at `0px` on the left card**, on BOTH components, while the other 8 variants each read 10px. So hovering the Fixtures card squared off its corners. Fixed 2026-10-05 by writing `borderRadius: "10px"` onto that one layer in that one variant on each component; re-audited at **18/18 variants = 10px**, and a full 78-layer before/after diff showed the only substantive changes were those two.

**Why no previous check could have caught it.** The published HTML contains **zero `border-radius` CSS rules** — Framer emits radius **inline** on the element (`style="border-bottom-left-radius:10px;…"` on `Product Card`) and applies the variant override through JS motion styles at hover time. So grepping the published stylesheet, diffing against stock, and class-swapping are all structurally blind to it. **Reading the canvas is the only method that sees variant-scoped radius.** This is the concrete example behind the "class-swapping does NOT reproduce a hover" gotcha.

**This is a candidate explanation for the long-unresolved "inner edge looks wrong while the hover settles" report, but it is NOT confirmed** — the reported symptom was *narrowing*, and a corner going square reads boxier rather than narrower. Re-check with a human eye on a real hover now that the radius is consistent, before assuming it is resolved.

**Two cosmetic inconsistencies found in the same audit and deliberately left alone:** the two components disagree on the base-variant left `Overlay` width (Row 1 `100%`, Row 2 `120%` tracking its image) — equivalent in practice because the card masks overflow; and Row 1's right hover `Component`/`Video` reads `100%/100%` with no aspect ratio where its siblings carry `590px` plus a ratio. Both layers are `visible: false` or masked, so neither reaches the published CSS.

Verify radius with an element probe rather than by eye: sample `elementsFromPoint(card.left + 2, card.bottom - 2)` and the same at `right - 2`. A 10px radius puts that point outside the shape, so a correct card returns the **row background**; a square-cornered one returns **`Product Card`** itself. Reading zoomed screenshots for this is unreliable and produced a wrong call on 2026-10-02 before the probe settled it.

**CMS, re-read and clean 2026-10-02:** Home = 2 (`Fixtures` Live / `polestar` / 1, `Elements` Live / `arrival` / 2). Projects = 10, three Live at Sorting Order 1/2/3 (`positive-energy`, `first-round`, `the-leader`, all with Next Project 1 = 1 and 2 = 2) and seven Draft at 4–10. Fixtures = 11, Elements = 5, News = 7.

**How to re-check.** Open the published page, scroll to ~1300, then class-swap the row root through `framer-v-1rizoid` and `framer-v-3q8m7a`, measuring the enclosing `Product Card` each time (see the class-swap gotcha). Remember this only validates CSS-driven geometry — it cannot reproduce a hover, so anything animation- or binding-dependent still needs a human in a real window.

**Four long-standing "known-open" items were re-tested on 2026-10-02 and are stale — do not re-open them without re-testing first:**

| Item as recorded | Actual state |
|---|---|
| `Navigation Desktop` `Click -> Tap 2` swallows the logo's home link | **Works.** The logo publishes as `<a href="./">`, nothing covers it (`elementFromPoint` resolves to the anchor), and a real click took `/projects-list` -> `/`. The nav containers are plain `div`s with `cursor: auto`. |
| `/projects-list` reports collection-filter errors | **None.** No error text anywhere in the editor UI, no error badges on the canvas, and the published page renders `Main` 878 tall with a 478px `Projects List` and all three rows. |
| `Before Scroll State` redundant `120% / 204.329` override | **Gone.** Both labels read grey (not purple) at `120% / 203.504`, i.e. the base values, so there is no override left to reset. |
| Static "(3)" count label is wrong | **Correct as it stands.** It reads `(3)` and there are exactly 3 Live projects. It is still *static*, so it does need editing by hand whenever that count changes — but nothing is wrong today. |

**The "Made in Framer" badge is not a canvas layer.** It is `#__framer-badge-container`, injected by Framer's platform into the published page (an `<a>` reading "Create a free website with Framer…"). It cannot be deleted in the editor or by removing layers — **it tracks the plan**. `Alkimi (Shak)` went Pro on 2026-10-05, so it is going away, but **only at the next publish**: the badge is written into the HTML when the site is built, so an upgrade does not clear an already-deployed build. Verify with `grep __framer-badge-container` on the served page — **0** occurrences means clean, **2** means the build predates the upgrade. The old `FramerButton` component was a third-party badge-hider hack; its 12 instances were deleted 2026-10-02 and the code file itself was removed from Framer 2026-10-05.

## Dispatch board (cross-surface coordination)

The shared board is **GitHub issue #1** in the **private repo `shak-alkimi/dispatch`** — the single coordination channel between desktop agent sessions (this repo, the configurator repo) and Shak's Claude mobile app. It stays open permanently. Body sections: Now / Next / Blocked / Needs-Shak's-call / Decisions-log; the comment thread is the running log (mobile drops decisions there).

- **Session start:** `gh issue view 1 --repo shak-alkimi/dispatch --json body` for state, AND `--comments` for decisions Shak left from mobile.
- **Update trigger — do NOT wait for "session end".** Update the body **as soon as anything ships**, where "ships" is a checkable list, not a judgement call:
  - a write to Framer (`setFileContent`, `setAttributes`, `codeFile.remove()`, a CMS edit) — **and any publish**
  - a file added or deleted in this repo
  - a report, audit or decision record produced
  - a verdict overturned, or a claim in this file corrected

  Then: overwrite the state sections, APPEND to Decisions-log, bump the "Last updated" footer.

  **Why this is spelled out.** The old wording was "session end (or after shipping something)", and on 2026-10-05 the second clause got dropped in practice: the board tracked correctly until 17:00, then **seven commits landed between 17:08 and 17:48 with no update** — a full-site audit carrying two launch-blocking findings, plus four code files deleted from Framer and the repo. The cause was that each task flowed straight into the next request, so the conversational pause that had been triggering updates never arrived. **"Session end" is not a checkable condition in a long run; "something shipped" is.** The gap was only closed because Shak noticed the board had stalled.

  **This matters more than ordinary record-keeping**, because the board is last-writer-wins coordination that other surfaces *trust*. During those 40 minutes a mobile or Codex session reading the board would have seen a healthy site with no audit and no deletions. **Stale coordination data is worse than none.**
- **Clobber guard (mandatory):** body updates are last-writer-wins — ALWAYS re-read the body immediately before overwriting and carry forward anything another session added. Never write from a stale copy.
- **Content hygiene:** even though the repo is private, never post credentials/tokens/secret URLs, customer data, vulnerability details, patent-sensitive configurator logic, pricing formulas, or SOS/QBO account specifics.
- Board is coordination only — it is not a source of truth for site content (that lives in Framer) or app data (SOS / QBO / Base44).
- Codex (auditor) reads the board for awareness but never writes it — board upkeep is implementer (Claude Code) work.

## Other notes

- A standing audit of this repo (issues F1–F22, severity-grouped) lives at `C:\Users\shaki\alkimi-issues.md` — snapshot dated 2026-05-11. Most findings are minor. Verify before acting on a specific issue ID since code may have shifted.
- Sister repo: the internal quoting tool at `C:\Users\shaki\alkimi-code` (Base44 / Vite / React). Shared branding only — the codebases are independent.

## Known-open items in Framer (not repo work)

As of 2026-10-01, carried over between sessions:

- **LAUNCH BLOCKER — the legal pages existed on `Alkimi (teaser)` ONLY (found 2026-10-05; pages now rebuilt, see below).** www.alkimiworks.com has exactly three pages (`/`, `/terms`, `/privacy`, both effective 8 July 2026). `Alkimi (Shak)` had 16 and **none of them was legal** — both slugs returned **404** on staging, and nothing legal existed anywhere in this repo's git history. **The cutover would therefore have deleted both policies**, while the new site ships a Formspark form collecting name, email and message with no notice and nothing to link to. Text captured verbatim to [legal/privacy.md](legal/privacy.md) (**9** sections as published) and [legal/terms.md](legal/terms.md) (**10**), so it no longer depends on a project that is being retired. **Content was reviewed and settled by Shak on 2026-10-05, so the only thing still outstanding is that nothing links to the pages** — bundled into the stock-template cleanup below.
- **LEGAL PAGES — built 2026-10-05, UNPUBLISHED DRAFTS.** `/privacy` and `/terms` now exist on `Alkimi (Shak)`, cloned from `/404` (chosen because its `Main` holds a single `Container`, and its `GlobalScrollbarHider` is already `position: absolute`, so that fix came along for free). Both are **`draft: true`** — set explicitly, because `WebPageNode.clone()` returns `draft: false` despite the docs. They will NOT ship until someone clears that flag. Layout: `Left Content` = title + kicker + effective date; `Right Content` = intro, then one frame per section holding an `h2` heading and a body paragraph. Privacy has **8** sections, terms **10**. Text came from [legal/privacy.md](legal/privacy.md) / [legal/terms.md](legal/terms.md) programmatically — nothing was retyped. **The QuickBooks/"Opus" clause was dropped on Shak's instruction (2026-10-05)** and the remaining privacy sections renumbered 1-8; that disclosure describes Opus, the internal quoting tool, not this marketing site. Terms is carried over unchanged. **Both pages were reviewed and settled by Shak on 2026-10-05 — the content is final; do not reopen it.** The only remaining gate is linking.
- **PRE-LAUNCH — stock Ora template cleanup (one bundle, deferred here 2026-10-05 on Shak's call).** Staging is still substantially the stock template, and the two outstanding legal-page links were folded in here rather than done separately, because all of it is hand work in the editor on published pages. The list:
  - `<title>` still reads **`Ora® — Agency Framer Template`**.
  - The Instagram link still points at **`instagram.com/ena.supply`**.
  - All three news articles are the template's own (Aesop, Mush Energy, "The making of an award-winning website").
  - `/contact` still shows **`hello@ora.com`** in `Main → Section CTA → Content Wrapper →` first `Stack`.
  - **Footer links to `/privacy` and `/terms`** — the sitemap column is `Footer / Footer` → `Stack` → `Row Bottom` → `Content` → `Right Content` → first `Column` → `Link Wrapper`, holding one `Stack` per link wrapping a `Text Link / Text Link - Underline` instance. Label and href are the instance controls **`UvO00kpP1`** and **`pN5qcoZCL`**. Three footer breakpoints: Desktop, Tablet, **Mobile**.
  - **A privacy link beside the contact-form submit** — target is `Main → Section CTA → Content Wrapper →` the **second** `Stack`, the one holding `FormSpark`, not the heading one.
  - **Clear `draft: true` on `/privacy` and `/terms`** once the links above are in. Content review is **done** (Shak, 2026-10-05), so linking is the only remaining condition.

  **None of the last three can be scripted** — see the canvas-editing limits in the Agent CLI section: `parentId` is honoured only on draft pages, so on a published page or inside a shared `ComponentNode` the new node is silently dropped onto the Home page instead. Both were attempted on 2026-10-05, confirmed not to have persisted, and the strays removed; footer and `/contact` were verified unchanged afterwards. Flipping `/contact` to `draft` would make the API accept the edit, but that leaves a live page excluded from publishing if anything interrupts — not worth it for one line of text.
- Home page "First Round" project card has `Source: External` — should be `Projects`, which is why replacing its CMS thumbnail had no effect.
- **Mirror completeness and dead-file cleanup — both resolved 2026-10-05.** Framer's code panel held 14 files; `Pagination.tsx` and `FramerButton.tsx` were proven to have **0 canvas instances** and removed with `codeFile.remove()`. The repo and `Alkimi (Shak)` are now a **1:1 mirror of the same 12 files**, verified byte-identical (the only byte-count differences were CRLF in the repo's working tree). `framer-snapshot/` still holds all 14, so nothing is actually lost. The equivalent cleanup in `Alkimi (teaser)` is **not** done — both files are still there, also at 0 instances.
- The three Live projects still publish under Ora template slugs: Belmont Park at `/projects/positive-energy`, Resorts World at `/projects/first-round`, Tuft at `/projects/the-leader`. Pre-launch is the cheap moment to rename them; re-check the Home and nav links afterwards.
- Home projects row, hover: **all three defects are now fixed and confirmed by the user** — the ~4px card-height mismatch and the right card's vanishing photo (2026-10-02), and the inner-edge "narrowing" (2026-10-05), which turned out to be the left card's corner radius collapsing to square during hover. The transition was also measured at 60fps on 2026-10-05 and is geometrically clean in every frame. **Nothing is outstanding on this row.**
- Both cards' hover `Video` layers are **`Visible: No`** (2026-10-02). Their `Source -> URL` was bound to a CMS field `Thumbnail Video URL - Wide` that does not exist on the **Home** collection, which Framer showed as a purple `Missing` pill on `Visible`. Hiding them also removed the last `aspect-ratio: 1.18045` outlier from the published CSS, since a hidden layer emits no rule. **Re-enabling hover video is a three-step job, not a toggle — and doing it as a toggle reintroduces the original card-height bug.** In order: (1) add `Thumbnail Video URL - Wide` to the Home collection and rebind the `Video` `Source -> URL`; (2) **fix the sizing first** — a canvas audit on 2026-10-05 found `Home - Projects Row` → `Home Projects - Right Open` → right `Video` sitting at **`100%/100%` with no aspect ratio at all** (residue from the aspect-lock conversion), and `Home - Projects Row` → `Home Projects Left Open` → left `Video` still carrying the stale **`1.18`** ratio instead of `1.17458`; a layer with a wrong or missing ratio inside the card is exactly what caused the original ~4px height mismatch; (3) only then set `Visible: Yes`, and re-measure both cards in all three states. While they stay hidden none of this reaches the published CSS, which is why it is safe to leave — but it is dormant, not fixed.
- **The two row components disagree on base-variant left `Overlay` width — Row 1 `100%`, Row 2 `120%`. Checked 2026-10-05 and deliberately left alone; do not "fix" it.** The `Overlay` is a vertical gradient shading the lower card, so its width cannot change appearance as long as it covers the card, and the card masks overflow either way. Overlays were confirmed to track their image in every measured state. Recorded here only so a future audit does not re-flag it as a defect.
- Seven Draft projects occupy `Sorting Order` 4–10, two of them duplicates (`Glossier Copy`, `Hyundai Motor Group Copy`) created 2026-10-01 purely to fill grid slots 9/10 in the canvas. They are invisible on the published site. If any go Live, the static "(3)" count label needs updating by hand.
