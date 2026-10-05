# Alkimi (Shak) — full-site irregularity audit

**Date:** 2026-10-05 · **Target:** `Alkimi (Shak)` / fulfilled-development-106906.framer.app
**Method:** Framer Agent CLI against the canvas (39 components, 14 pages, 5 CMS collections) + HTTP sweep of all 10 published URLs + live DOM reads via Chrome.
**Scope:** asymmetries, errant content, duplicates. Not a design review.

> This audit changed nothing. Every item below is a finding, not an action taken.

---

## A. Stock Ora template content, live and public

The largest category by far. All of it is reachable today.

| # | Finding | Where |
|---|---|---|
| A1 | **Every page carries the template's `<title>`**: `Ora® — Agency Framer Template` | all 10 pages |
| A2 | **Every page carries the template's meta description**: *"Meet Ora. A sleek and vibrant Framer template designed with precision…"* | all 10 pages |
| A3 | **`og:title`, `twitter:title`, `og:description`, `twitter:description` are all the same**, and `og:image` / `twitter:image` point at the Ora promo image (`LOwLASviX95ZIaLR3vX60YyBOdY.jpg`). Sharing any page anywhere renders an Ora template card. | all 10 pages |
| A4 | **`/careers` advertises fabricated job openings** — "Senior Art Director / New York", "Design Intern / London", "Marketing Manager". Live, in the sitemap, and linked from the footer on every page. | `/careers` |
| A5 | **All 3 live News articles are the template's own** — Mush Energy, "The making of an award-winning website", "How Aesop has reshaped the industry". 4 further stock articles sit in draft. | `/news` + 3 detail pages |
| A6 | **Five stock `mailto:` addresses are live**, four of them fictitious people: `hello@ora.com`, `marcus.nguyen@ora.com`, `monica.lambert@ora.com`, `olivia.bennett@ora.com`, `tommy.jacobson@ora.com` | `/contact` |
| A7 | **All three social links point at the template author's accounts**: `twitter.com/ena_supply`, `instagram.com/ena.supply/`, `linkedin.com/company/ena-supply` | site-wide, 6 refs per page |
| A8 | `hello@ora.com` appears 16 times | `/contact` |

**A4 and A6 are the two worth acting on first** — fabricated vacancies and fictitious staff contacts are things a visitor can actually act on.

---

## B. Structural irregularities

| # | Finding | Detail |
|---|---|---|
| B1 | **`/careers` publishes completely empty.** Its HTML body is `<div id="main"></div>` — **0** `data-framer-name` layers, against **151** when rendered in a browser. 28 KB where every other page is 215–397 KB. | It *works* for a human (client-side render, 4799 px tall) but any crawler that does not execute JS sees a blank page. It is the only page that behaves this way, which points at a publish/SSR failure rather than a setting. |
| B2 | **Footer placement is inconsistent.** On `/products` and `/elements` the footer sits *inside* `Main`; on every other page it is a sibling of `Main`. | Both render a footer, so nothing is visibly broken — but any layout rule applied to `Main` reaches the footer on those two pages only. |
| B3 | **News title/slug contradiction.** Title reads "Mush Energy just won 2 **gold** awards"; the slug is `…has-just-won-2-silver-awards`. | The title was edited and the slug was not. The slug is the public URL. |
| B4 | **Multiple `<h1>` per page**: `/contact` has 5, `/about` 4, `/` 2, `/news` 2. | Template behaviour, but worth a deliberate decision before launch. |

---

## C. Duplicates

| # | Finding |
|---|---|
| C1 | **Five components contain two variants sharing one name** — `Navigation / Navigation Desktop` → `Nav white` ×2 (of 11); `Text Link / Text Link - Underline` → `Link HoverLight ` ×2; `Accordion / Accordion Row` → `Desktop -  Closed` ×2; `About / Client Card` → `Logo card hover` ×2; `Projects CMS Page / Hero Image - Video Projects Page` → `Initial State` ×2. Referring to any of these by name is ambiguous. |
| C2 | Two of those names also carry **whitespace defects** — `Link HoverLight ` has a trailing space, `Desktop -  Closed` a double space. |
| C3 | **Two duplicate Projects CMS items** — `Glossier Copy`, `Hyundai Motor Group Copy` — created 2026-10-01 purely to fill grid slots 9/10 in the canvas. Draft, so invisible publicly. |

---

## D. Slugs that do not match their content

| # | Finding |
|---|---|
| D1 | **6 of 11 Fixtures** publish under unrelated slugs: `Flow 20`→`magnet-02`, `Flow Spine`→`magnet-03`, `Flow Straight`→`magnet-04`, `Prisma Multiplier`→`optic-01`, `Prisma Link 1`→`optic-02`, `Prisma Link 2`→`optic-03`. The five `Vena` items are correct, and all 5 Elements are correct. |
| D2 | **Home collection cards** use car-brand slugs from the template — `Fixtures`→`polestar`, `Elements`→`arrival`. |
| D3 | **All 3 live Projects** use template slugs — Belmont Park→`positive-energy`, Resorts World→`first-round`, Tuft→`the-leader`. |

Pre-launch is the cheap moment for all of D; afterwards each rename needs a redirect.

---

## E. Numeric and geometry oddities

| # | Finding |
|---|---|
| E1 | **Four line variants are `786.5 × 1`** — `Line Animation` and `Line Animation Active`, in *both* `Global / Line Animation Global` and `Global / Line Animation Projects List + Careers`. The other 12 are `787 × 1`. A half-pixel design width; these pairs drive the Home Newsroom divider, not the menu. |
| E2 | `About / Core Value / Approach Card` is **383.5 px** wide. |
| E3 | `About / About - Map / Map Tablet` is **342.85714285714283 px** tall (= 2400/7, an aspect-ratio remainder). |
| E4 | **Fixtures `Order` values collide**: `[1,2,3,4,5, 2,3,4, 1,2,3]`. They appear to restart per product family, but the Flow family **starts at 2, not 1** — either an item is missing or the numbering drifted. Elements is clean (1–5). |

---

## F. Canvas clutter (not published)

| # | Finding |
|---|---|
| F1 | `/careers` carries **8 stray top-level frames** named `Image Wrapper` / `Image Wrapper / Tablet Mobile`, alongside its 3 real breakpoints. |
| F2 | `/about` carries **4 stray top-level frames** named `Testimonial Mobile 1–4`. |

Neither publishes. They inflate the frame count (11 and 7 against an expected 3) and make breakpoint checks noisy.

---

## G. A documentation error this audit exposed

`CLAUDE.md` states the **Home** collection "has no such field" as `Thumbnail Video URL - Wide`, and that this is why the hover `Video` layers showed a `Missing` pill. **The field does exist.** Home has 26 fields, including `Thumbnail Video URL - Wide`, `Thumbnail Video URL - Portrait` and `Hero Video URL`. All three are **empty** on both items.

So re-enabling hover video does not require adding a field — only populating it, plus the two stale aspect ratios already recorded.

---

## H. Checked and clean — do not re-audit these

- **No broken internal links.** 15 distinct internal targets, all HTTP 200.
- **No duplicate CMS slugs** in any of the 5 collections.
- **No live sorting-order collisions** in Home, Projects or News.
- **`GlobalScrollbarHider`**: exactly one per real breakpoint, `position: absolute`, on every page.
- **Favicon present**, with light and dark variants.
- **No empty component variants** across all 39 components.
- **`/privacy` and `/terms` correctly excluded** from the published build by their draft flag — verified 404 and absent from the sitemap.
- **Elements `Order`** clean, 1–5.
- **Home projects row and nav menu**: separately audited and measured the same day; both correct.

---

## Suggested order

1. **A4, A6** — fabricated jobs and fictitious staff emails. Public, and a visitor can act on them.
2. **A1–A3** — titles, descriptions, share images. One fix each, affects every page and every share.
3. **B1** — `/careers` publishing empty. Diagnose before launch; it may indicate a wider publish fault.
4. **A5, A7, A8** — stock news, social links, `hello@ora.com`.
5. **D1–D3** — slugs, while renames are still free.
6. **B2, B3, C, E, F** — housekeeping, no user impact.

---

## I. Filter system — `/products` vs `/elements` (checked 2026-10-05)

**They are the same system.** Both pages instance the *same* code component, `ProductsFilterPills.tsx`. All six instances (3 breakpoints x 2 pages) carry identical props except one:

| | `/products` | `/elements` |
|---|---|---|
| Component | `ProductsFilterPills` | `ProductsFilterPills` |
| `optionSet` | **`Fixtures`** | **`Elements`** |
| Pills rendered | All · Flex · Profile · Optic | All · Connector · Driver · LED |
| activeOption / enableLinks / colours / font / padding / radius | identical | identical |

Internally there is one code path — `optionSet === "Fixtures" ? FIXTURES_FILTER_OPTIONS : ELEMENTS_FILTER_OPTIONS`. The layer is merely *named* differently on each page ("Products Filter" / "Elements Filter"), which is the only thing that makes them look like two systems.

### Three dead code files around it

| File | State |
|---|---|
| `ElementsFilter.tsx` | **0 canvas instances.** A separate earlier implementation, superseded by the unified component and never deleted. |
| `ProductElementsLink.tsx` | **Not attached.** |
| `ProductsFilterAutoSelect.tsx` | **Not attached.** |

The last two are the sessionStorage deep-link pair. Proven dormant by scanning every JS chunk referenced by `/`, `/products` and `/elements`: the string `products-filter` appears in **0 of 26** chunks (the scan was validated against a string known to be live). The Home category cards now navigate with plain `./products` and `./elements` hrefs instead.

**If that pair is ever re-attached it will misbehave.** `ProductElementsLink` sets `sessionStorage["products-filter"] = "Elements"` and sends the visitor to `/products`; `ProductsFilterAutoSelect` then clicks the first visible element whose text is exactly `"Elements"`. **There is no "Elements" pill on `/products`** — its options are All/Flex/Profile/Optic — so it would match the navigation link instead and bounce the visitor straight to `/elements`. The logic was written against a filter layout that no longer exists. Delete it or rewrite it; do not simply re-attach.

### Two presentation notes

- **The pills render in Inter 14px**, while brand headings on the same page render in **Gellix**. Counting computed fonts across visible text on `/products`: Inter 97 elements, Gellix (SemiBold + Medium) 15, General Sans 1. Needs a deliberate decision rather than a silent fix — the intended brand font for UI controls is not recorded anywhere.
- **Not a bug:** the pill `<button>`s compute `border-radius: 0px` despite the component's `radius: 999`. The rounding lives on the parent container (`999px` + `overflow: hidden`), so it is a segmented control inside a rounded pill. Working as designed.

> **Resolved 2026-10-05:** all three dead filter files were deleted from Framer and the repo after the checks above were widened to all 43 chunks across all 10 pages. Framer went 12 code files → 9; repo matches 1:1. See `CLAUDE.md` for the rationale on not repairing the deep-link pair.
