# Continuity audit — CMS, canvas, custom code, across Desktop / Tablet / Phone

**Date:** 2026-10-18 · **Build audited:** `fulfilled-development-106906.framer.app`, Last-Modified `22:44:52 GMT`
**Method:** Agent CLI for the document (collections, node trees, custom code); Playwright at 1536 / 900 / 390 for the rendered site, **a fresh browser context per breakpoint** and every page scrolled through before measuring.

---

## Verdict

**Structurally the site is clean.** Every page has identical node counts across all three breakpoints, every breakpoint divergence is a deliberate responsive swap, no page scrolls horizontally, and every page renders a nav, a logo and a footer at every width. The CMS carries no unresolvable pointers and every image is on `resolution: auto`.

**The irregularities that matter are content, not structure** — and two of them are live dead links.

---

## 1. Live defects

### 1.1 Two stock email addresses are clickable on the published site

| page | what renders | link |
|---|---|---|
| `/contact` | **`marcus.nguyen@ora.com`** as visible text under *Careers / Jobs*, attributed to "Marcus Nguyen" | `mailto:marcus.nguyen@ora.com` |
| `/careers` | a **"Send your portfolio"** button — the label is generic, so the address is invisible until clicked | `mailto:hello@ora.com` |

Both were confirmed **rendered and visible** in the hydrated DOM, not merely present in the serialised payload. `ora.com` is the Ora template author's domain.

**The `/careers` one is the easier to miss and the more costly**: a candidate clicking the primary call to action on the careers page sends mail into a void with no bounce visible to Alkimi. The `/contact` one additionally puts a **fictitious named person** on a real business contact page.

The same page also renders the genuine `orders@alkimiworks.com`, so the contacts block is currently half real and half template.

### 1.2 The footer Instagram is the template author's handle

`instagram.com/ena.supply` on **all nine pages** — it is in the shared footer, so it is one control to change, not nine.

### 1.3 /careers still streams two videos from the template author's CDN

```
ena-supply.b-cdn.net/Ora/587890_Silhouette Red Background Man Hoodie_...
ena-supply.b-cdn.net/Ora/740024_Woman Vj Color Lighting_By_Ira_Belsky_Artl...
```

**`/careers` is now the only page doing this** — `/about`'s hero was moved to Alkimi's own asset, so that dependency is down from several pages to one. It breaks silently the day that CDN stops serving.

---

## 2. Known-and-accepted, re-confirmed

- **`/terms` and `/privacy` return HTTP 404** — both still `draft: true`, and the footer sitemap carries no link to either. The content is settled; publishing is gated only on linking. **This remains a launch blocker for a site whose contact form collects name, email and message.**
- **Custom code** is a single global slot: `headEnd` = `<meta name="theme-color" content="#080200">`. Settled 2026-10-06; keep.
- **The static `(3)`** on the projects toggle matches the 3 live projects. Correct today, still manual.
- **Orphan canvas frames** outside the breakpoints: `/about` x4 (`Testimonial Mobile 1-4`), `/careers` x8 (`Image Wrapper`, `Image Wrapper / Tablet Mobile`). They emit no markup — dead canvas debris, not a rendering fault.

---

## 3. Breakpoint continuity — all clean

**Node counts are identical D/T/P on all 14 pages** (`/` 20, `/products` 91, `/elements` 93, `/about` 69, `/404` 15, `/terms` 45, `/privacy` 40, `/careers` 49, `/projects-grid` 22, `/projects-list` 41, `/contact` 63, `/projects/:slug` 52, `/news` 30, `/news/:slug` 61).

Every `visible` / `controls` divergence found is an intentional responsive swap:

| page | divergence | reading |
|---|---|---|
| all | `Navigation Desktop` D+T vs `Navigation Mobile` P | by design |
| `/about` | `Client Row` D+P vs `Client Row - Tablet` T | by design |
| `/about` | `Testimonial Slider` D+T vs `Slideshow - Mobile` P | by design |
| `/careers` | `Ticker` D vs `Ticker - Mobile` T+P, **phone overriding speed 65 to 75 and gap 60 to 30** | deliberate tuning |
| `/careers` | `Job Header` hidden on P | by design |

**Rendered checks at 1536 / 900 / 390 across 9 pages — 27 combinations, all passing:** no horizontal scroll, nav + logo + footer present everywhere, zero broken images.

Three pages report elements extending past the viewport edge; **all three are benign and none causes a scrollbar** — the `/careers` ticker is a marquee inside a clipping container, and the Home and `/about` phone cases are the documented hero headline whose *box* overflows while its *ink* does not.

---

## 4. CMS

**Healthy.** Draft counts match `repair/verify-draft-status.js` exactly — Home 3/3 live, Fixtures 11, Elements 5, Projects 3 live / 7 draft, News 3 live / 4 draft, About 1, Clients 8, Testimonials 4.

**Every image value is `resolution: auto`** across all eight collections. No `full`, no `lossless`.

**Every pointer field resolves:**

- Projects `Sorting Next Project 1/2` to `1,2` on all three live items, both present in Home. (These resolve against **Home**, not Projects — the documented trap.)
- News `Sorting Next Article 1/2` to the `1 -> 2,3 / 2 -> 3,1 / 3 -> 1,2` rotation, intact. Slot 3 points at drafts and renders nothing, by design.

### 4.1 Changes since the last record — all improvements, worth noting so the file is not trusted blindly

| | record said | now |
|---|---|---|
| Projects `About` / `Client` / `Category 1` / `Category 2` | empty on all live items, so `Section Details` rendered bare labels | **filled 10/10** (`Year` 9/10) |
| News `Time Read` | values retained | **cleared on all 7** |
| Projects `Image 3` / `Image 4` | set on Resorts World and Belmont | **empty on all 10**, consistent with the 3-image list rows |
| `/news/kimi` hero | missing — striped placeholder | **has a video hero** |
| page title | the stock Ora template title | **`Alkimi` on every page** |
| `ena-supply` | `/about` and `/careers` | **`/careers` only** |

### 4.2 Unused fields

**36 fields are empty on every item.** Most are inert stock Ora schema (`Thumbnail Image - Portrait`, the four video-thumbnail fields, `Quote` / `Quote Author`, `Preview Text - Featured`). Two are worth a decision because they are *visible gaps in real content*, not template residue:

- **`Dimensions Metric`** — empty on all 11 Fixtures **and** all 5 Elements, while `Dimensions Imperial` is filled on every one. A metric-only audience currently gets nothing.
- **`Footnote`** — empty on all 16 products in both collections.

`Clients` (8 items) and `Testimonials` (4 items) remain **wired to nothing** since those `/about` sections were hidden, and `About` still carries `Clients Heading` / `Testimonials Heading` for the same reason.

---

## 5. One cosmetic inconsistency, inert

On **Home**, the `News / News Article` instance stores literal stock strings on Desktop and Tablet — `"How creator nike connects with their fans"`, `"Sustainable Fashion"` — and **empty strings on Phone**.

**None of it renders**: all three strings return **0 occurrences** in the published Home markup, because the card's content comes from the CMS binding. These are design-time placeholder values that were cleared on one breakpoint and not the others.

Harmless, but it is the one place where the three breakpoints hold genuinely different stored content, and the strings are draft-article titles — so anyone grepping the document for stock content will trip over it.

---

## Recommended order

1. **`mailto:hello@ora.com` on `/careers`** — a dead primary CTA, and the hardest to notice.
2. **`marcus.nguyen@ora.com` on `/contact`** — a fictitious person on a real contact page.
3. **Footer Instagram** — one control, all nine pages.
4. **`/careers` CDN videos** — the last third-party dependency on the site.
5. **Link and publish `/terms` and `/privacy`** — the standing launch blocker.
6. Decide on `Dimensions Metric`; tidy the Home placeholder strings and the orphan frames whenever those pages are next open.
