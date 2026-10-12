# Full-site audit — fulfilled-development-106906.framer.app

**Date:** 2026-10-12 · **Build audited:** `Published Oct 11, 2026, 10:29 PM UTC`
**Scope:** 10 published pages + 3 news articles + 3 project detail pages, plus the Framer document and CMS.
**No changes were made.** Findings list only.

---

## A. Blockers — must not reach a public domain

### A1. `/about` carries fabricated testimonials attributed to named people at real companies

The page presents three endorsements as if genuine:

| Name | Claimed role |
|---|---|
| Lisa Kudrow | Head of Design, **Sony** |
| Nick White | Managing Partner, **Adidas** |
| Francis Haugh | Founder of Sensa |

These are Ora template placeholders. Published under Alkimi's name they are false statements about real companies and named individuals — a different class of problem from ordinary template residue. The rest of the page is agency copy too ("We partner with founders who are ready to make a change"; services listed as Branding / Art Direction / Development / Research / Experimentation), none of which describes an LED tape-light business.

### A2. `/contact` lists four fictitious staff with `@ora.com` addresses

`marcus.nguyen@`, `monica.lambert@`, `olivia.bennett@`, `tommy.jacobson@`, plus `hello@ora.com`. The page also gives a physical address — **209 Hudson Ave, Brooklyn, NY 11201** — with a Google Maps link pointing there. None of it is Alkimi's.

### A3. `/careers` advertises five jobs that do not exist

Design Intern · Marketing Manager · Motion Designer · Studio Manager · Senior Art Director, across Athens / London / New York / Tokyo, under "A global team of experts." Visitors can and will apply.

### A4. The contact form submits nowhere

The form renders with `method="POST"` and **no `action`**, and the string `submit-form.com` (Formspark's endpoint) appears **0 times across every page on the site**. The `formId` is empty, as previously recorded. Anyone who fills it in gets nothing and no enquiry is captured.

### A5. The share image is the Ora template's own marketing collage

`og:image` and `twitter:image` on **all 16 pages** are `LOwLASviX95ZIaLR3vX60YyBOdY.jpg` — a 1200×630 montage of Ora template screenshots, including the Ora wordmark, Nike branding and "Designing brands today for tomorrow". This is what renders whenever any Alkimi page is shared to Slack, LinkedIn, WhatsApp, iMessage or X.

### A6. The favicon is the Ora® wordmark

`WNUCX3GjfeNYRgTPkNr8oPMieI.jpg`, 32×32 — the template vendor's logo in the browser tab on every page.

### A7. Every page's meta description advertises the template vendor

All 16 pages carry: *"Meet Ora. A sleek and vibrant Framer template designed with precision, ideal for contemporary agencies and innovative projects. **Made by ena.supply**"*. The string `ena.supply` appears 4× per page, site-wide.

### A8. `<title>` is the template's on 13 of 16 pages

`Ora® — Agency Framer Template` on `/`, `/about`, `/careers`, `/contact`, `/elements`, `/news`, `/products`, `/projects-grid`, `/projects-list` and `/404`. Only the six CMS detail pages have their own titles, and those are suffixed **`- Ora©`**.

### A9. All three social links point at the template author

- Instagram → `instagram.com/ena.supply`
- LinkedIn → `linkedin.com/company/ena-supply`
- X/Twitter → `twitter.com/ena_supply`

Only the Instagram link was previously on the cleanup list; the other two are equally live.

### A10. No privacy or terms link exists anywhere on the site

The strings "privacy" and "terms" appear on **zero** pages. The footer sitemap column is Case studies / About / Careers / News — no Contact either. `/privacy` and `/terms` exist in the document as **unpublished drafts**, so a form collecting name, email and message currently ships with no notice and nothing to link to.

---

## B. Visible content defects

### B1. Five fixtures display Elements' dimensions; six display a literal placeholder

`/products` renders `Dimensions Imperial` faithfully — the stored data is what is wrong:

| Fixture | stored value | |
|---|---|---|
| Vena | `0.20 × 0.25″` | = Rima 5's size |
| Vena Corner | `0.31 × 0.31″` | = Rima 10's |
| Vena Mini | `0.35 × 0.38″` | = Liga T's |
| Vena Corner Mini | `0.44 × 0.52″` | = Liga W's |
| Vena Round Mini | `0.44 × 0.50″` | = Driver 5-1's |
| Flow 20, Flow Spine, Flow Straight, Prisma Multiplier, Prisma Link 1, Prisma Link 2 | **`— × — ″`** | literal placeholder string |

The five Vena values are the five Elements values in the same order — consistent with a copy-paste when the collection was populated. Sub-inch dimensions are not plausible for an architectural fixture.

**Status: deliberately left as-is (Shak, 2026-10-12).** There is no authoritative source for the real figures — see B8 — so the choice was between leaving the wrong values or clearing them to the same `— × — ″` placeholder the other six carry. Shak chose to leave them pending real specs. **Do not "fix" this by inventing or inferring dimensions.** The Elements values are treated as correct: they match the figures recorded in CLAUDE.md and are physically plausible (`Rima 5 = 0.20″` is 5.1mm, matching a 5mm COB coil), which is consistent with them being the genuine source the Vena entries were copied from.

### B8. The `Spec Sheet`, `Manual` and `IES` buttons are dead

Every product row on `/products` and `/elements` renders all three buttons with **no `href` attribute at all**, and no PDF, IES or document link exists anywhere on the site. They look clickable — full brand-green button styling, `tabindex="0"`, `data-highlight="true"` — and do nothing. This also means there is no document source from which the missing dimensions in B1 could be recovered.

### B2. Two of three news articles show a striped placeholder where the hero image should be

`Image Hero` is empty on `cauda` and `opus`, so the hero renders Framer's 126×126 diagonal-stripe tile with nothing above it — confirmed by zero `framerusercontent` references inside the `Thumbnail` block on both pages. (`lumens` is fine; it now has the video hero.)

### B3. All three news articles show two more striped placeholders in the body

`Image 1` and `Image 2` are empty on all three live articles. The `Image Duo Wrapper` inside `Section Article` renders two exposed placeholder tiles on each.

### B4. All three project pages show bare labels with no values

`Section Details` was restored on 2026-10-11, but `About`, `Client`, `Category 1`, `Category 2` and `Year` are **empty on all three live projects**. Rendered output:

```
About
Client
Category
,            <- the separator between two empty category fields
Year
```

This is the stray-comma block from the earlier screenshot; restoring the section brought it back.

### B5. `/projects-list` still renders a fourth empty tile — on tablet only

Desktop and mobile emit exactly 3 image wrappers per row. **Tablet emits 4**, and the fourth has no image:

```
Non Active         ::  Hero, 1, 2          3 rows, all with images
Mobile Non Active  ::  Hero, 1, 2          3 rows, all with images
Tablet Non Active  ::  Hero, 1, 2, 4       wrapper 4 -> 3 rows, 0 images
```

The 2026-10-11 fix was verified against the rendered desktop DOM, which could not see this. Likely cause: `Image Wrapper 4` is condition-bound on Desktop and hidden outright on Mobile, but on Tablet it is neither — so the boolean never gates it.

### B6. Every product row shows an empty square beside its photo

`Technical Drawing` is empty on **11 of 11** Fixtures and **4 of 5** Elements, and `Drawing Placeholder` renders as a bare `#f7f6f2` square regardless. `/products` shows 11 photo/empty pairs, `/elements` 5. Only Liga T has a drawing, and that layer is deliberately hidden, so it does not show either.

### B7. `Dimensions Metric` and `Footnote` are empty on all 16 products

If the metric values are ever surfaced by a unit toggle, every row will be blank.

---

## C. Structural and technical

### C1. Three hero videos are served from the template author's CDN

`/about`, `/careers` and `/contact` load five videos from **`ena-supply.b-cdn.net`** (7 references). All five return 200 today. They are a third party's files on a third party's bandwidth, removable without notice — and the filenames carry Artlist stock credits (`..._By_Ira_Belsky_Artlist_HD`, `..._By_Thomas_Gellert_Artlist_HD`), so the licence sits with the template author, not Alkimi.

### C2. The staging site is fully indexable

`robots.txt` is `Allow: /`, no page carries `noindex`, and `sitemap.xml` lists all 16 URLs. Template copy, the fabricated testimonials and the Ora share card are all crawlable, and this will compete with the real domain as duplicate content once it launches.

### C3. `/404` is listed in `sitemap.xml`

An error page should not be submitted for indexing.

### C4. No image on the site has alt text

Across all 16 pages: `/` 15/15 missing, `/about` 59/61, `/projects-list` 27/27, `/products` 11/11, `/elements` 5/5, `/careers` 14/14, each project page 9/9. Two images on `/about` carry alt; nothing else does.

### C5. News article pages have no `<h1>`

`/news/lumens`, `/news/cauda` and `/news/opus` start at `<h2>`. The article title is not a heading element.

### C6. Home has no heading below `<h1>`

The home page emits only `h1` elements — the Newsroom and section headings are not semantic headings.

### C7. The Aesop hero video is `preload="none"` with a large file

4.6 MB at 3.5 Mbit/s, fetched only once playback is attempted. The poster now covers the gap, but on a slow connection the still will hold for several seconds before motion starts.

### C8. The Home Fixtures card is undersampled

`G9BZgzpcGBJmwSmrCo9gtzesQCQ.jpg` is **772×772** against a render of roughly 1340 device px — about 0.58×. Known; only a re-render fixes it.

### C9. A published page can return a truncated response for minutes after a publish

Observed repeatedly: `/news/lumens` and `/news/opus` returned **28,684 bytes** against a real 208,361 and 217,136, with no `<video>`, no layers and no content. Re-fetch until two reads agree before diagnosing anything post-publish.

---

## D. Checked and clean

- **No broken internal links.** 15 unique internal targets across all 16 pages, all 200 — resolved in the browser rather than by string manipulation.
- **No `lossless=1` anywhere** — the 2026-10-09 image-delivery change is holding on every page.
- **Home regression baseline passes** — 11× `aspect-ratio:1.17458`, 0 stale `1.180xx`, both Elements breakpoint ratios, 2 hero overlays, `#f7f6f2` with no `#f6f4f0`, 60fps orb on 3 breakpoints, no stale "View Case Study".
- **No Framer badge** on any page.
- **Draft counts correct** — Projects 3/10, News 3/7, Home 3/3, Fixtures 11/11, Elements 5/5.
- **No stray video nodes** left on the canvas.
- **The news video hero works in both directions** — `lumens` renders a video and no thumbnail; `cauda` and `opus` render a thumbnail and no video.
- **`/projects-list` is correct on desktop and mobile** (3 rows × 3 images) — see B5 for tablet.
- **The static "Case Studies (3)" label is correct** — there are exactly 3 live projects.
- **The brand green is present** on Home, emitted as lowercase `#35790b`.

---

## E. False alarms ruled out — do not re-chase

- **`https://example.com`** appears once on `/404`, but inside Framer's own runtime JavaScript (a URL-parsing helper). It is not a link.
- **`/lumens` and `/opus` returning 404** — an artifact of resolving `./lumens` as root-relative. On `/news/cauda` those hrefs correctly resolve to `/news/lumens`. The browser-resolved check found no broken links.
- **Placeholder tiles on `/`, `/projects-grid` and the project pages** — present in the markup but covered by a real image in every case. Only those in B2, B3 and B5 are exposed.
- **Multiple `<h1>` per page** — Framer SSRs each breakpoint separately, so the duplicates sit in hidden variants and are not visible duplicates.
