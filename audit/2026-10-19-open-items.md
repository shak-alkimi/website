# Open items — verified 2026-10-19

Every line below was re-checked against the live site, the document or the CMS on this date.
Nothing is carried forward on trust; four previously-listed items were retired because they
are already fixed (see the bottom of this file).

## 1. Live defects — a visitor can hit these today

| # | item | evidence |
|---|---|---|
| 1 | **`/careers` "Send your portfolio" points at `mailto:hello@ora.com`** | rendered link, 2 refs. The label is generic so the dead address is invisible until clicked — mail goes nowhere and Alkimi never sees a bounce |
| 2 | **`/contact` shows `marcus.nguyen@ora.com`** | **rendered visible text AND a `mailto:` link**, attributed to a fictitious person, beside the genuine `orders@alkimiworks.com` |
| 3 | **Footer Instagram points at `instagram.com/ena.supply`** | rendered on **all 12 pages** — the Ora template author's account |
| 4 | **`/careers` loads two videos from `ena-supply.b-cdn.net`** | 4 refs. Stock footage on a third party's bandwidth; breaks the day they stop serving it |

`/contact` also carries one `hello@ora.com` in its payload, but it sits in the hidden
`Section Hero` and does not render.

## 2. Launch sequence

| # | item | state |
|---|---|---|
| 5 | **Domain cutover has NOT happened** | `www.alkimiworks.com` still serves the 3-page teaser — `/`, `/terms`, `/privacy` only; `/products` and `/news` return **404**. Home is 125,901 bytes against staging's 282,099, and carries no Gellix |
| 6 | **Formspark migration** | staging's `FormSpark` instances still have an empty `formId`, so the staging contact form is not wired to anything |
| 7 | **This file and the internal records move to a private remote at launch** | `shak-alkimi/website` is still public. The agreed trigger was launch weekend, which has now passed without the cutover |

## 3. Content gaps

| # | item | evidence |
|---|---|---|
| 8 | `Dimensions Metric` empty on **16/16** products | Fixtures 11/11, Elements 5/5 — while `Dimensions Imperial` is filled on every one |
| 9 | `Footnote` empty on **16/16** products | same split |
| 10 | `Clients` (8 items) and `Testimonials` (4 items) collections drive **nothing** | 0 references to either collection id on any published page; their sections are hidden |
| 11 | `About` collection: `Clients Heading` + `Testimonials Heading` orphaned | the sections they describe are hidden |
| 12 | `/about` hero is not CMS-bound | **deliberate** — phone uses a different video and poster, which one field cannot express |

## 4. Maintenance and consistency

| # | item | note |
|---|---|---|
| 13 | **Menu divider stagger has a 300ms hole** | surviving variants are 1, 2, 4, 5, 6 with delays `0.2/0.35/0.65/0.8/0.95`, so rows 2->3 is double the measured 150ms. Fix is three `Delay` edits to `0.5/0.65/0.8`. **Transitions are not exposed through the node API**, so this cannot be verified or changed by script |
| 14 | 12 orphan page-level frames outside the breakpoints | `/about` x4 `Testimonial Mobile 1-4`, `/careers` x8 `Image Wrapper` / `Image Wrapper / Tablet Mobile`. They emit no markup — dead canvas debris, not a rendering fault |
| 15 | `About` vs `Methodology` naming divergence | nav row and footer sitemap say **About**; the Home wide card says **Methodology** |
| 16 | Privacy link beside the contact-form submit | never added |
| 17 | Hamburger tap target is asymmetric | `44x44` on the white variants, `44 x fit-content` (~9px) on the black ones. Invisible either way now the fills are gone, but it is a touch-usability difference on six pages |
| 18 | Open-menu close button unconfirmed by eye | the DOM reports it healthy (white lines, opacity 1) while a screenshot of the open menu comes back blank — an environment artifact that predates the hamburger change. Needs a human look |
| 19 | `/404` trailing space is 257px | against the 200 now used on the legal pages and `/news`. Minor, and within the site's range |

## 5. Artwork — cannot be fixed in layout

| # | item |
|---|---|
| 20 | **Phase 2 of the drawing work: one pen width across all 16.** Per-drawing source pen spec is recorded in CLAUDE.md |
| 21 | **Prisma Link 1 and 2 source frames are only 641px and 385px** after the size-hierarchy crops, so they are upscaled into a 587px card. They need larger source renders, not a different pen |
| 22 | `Flow Spine` needs a longer drawn run to reach the shared right anchor while staying left-flush |
| 23 | Home Fixtures card is a 772px crop rendering into ~1340 device px — soft. Needs a render framed at that close-up, 1500px+ |
| 24 | Resorts World `Image 1` master is `739x415`; no delivery setting can help it |
| 25 | The contact map is still composed around **Downtown Brooklyn**. Moving the pin is not enough — it needs a new export centred on 387 Park Ave S |

## Retired this pass — previously listed, verified fixed

- **Orphan variant `hLYcAEbg2`** on `Utilities / Primary Button` — **gone**; the component now has 12 variants
- **`resolution: full` on component-instance control images** — `/about` emits `srcset` on all 5 images, so these are on `auto`
- **`twitter.com/ena_supply` and `linkedin.com/company/ena-supply`** — 0 across all 12 pages
- **`<title>` reading `Ora® — Agency Framer Template`** — 0; every page reads `Alkimi`
- **`ena-supply.b-cdn.net` on `/about`** — gone; only `/careers` still uses it
