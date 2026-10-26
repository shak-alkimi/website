# Framer runtime regression — a flex child of a scale-animated parent is positioned against the parent's final layout box

**Reported by:** Alkimi (shak@alkimiworks.com)
**Date:** 26 October 2026
**Affected runtime:** introduced between `2026-10-20T15:59:47Z` and `2026-10-21T22:10:37Z`
**Severity:** visual defect on a published site, ~250 ms per occurrence, no error logged

---

## Summary

When a Framer component animates a layout change by scaling a parent and counter-scaling its children,
a child positioned by `justify-content` now resolves its offset against the parent's **final layout box**
instead of the parent's **animating visual box**.

Where that child is deliberately larger than its parent and anchored to one edge — a common "card as a mask
sliding over a stationary image" pattern, and the one used in your own Ora template — the child stops
covering the parent for the duration of the animation, exposing whatever sits beneath it.

In our case that is roughly 145 px of bare card plus Framer's diagonal placeholder tile, on the home page of
a live site.

## Affected versions

The page attribute `data-framer-ssr-released-at` identifies the runtime a build was served with. We have
captures of the same site across five runtime releases and the behaviour changes between two consecutive
ones:

| runtime (`data-framer-ssr-released-at`) | result |
|---|---|
| `2026-10-15T11:41:32Z` | clean |
| `2026-10-16T08:56:29Z` | clean |
| `2026-10-19T21:45:06Z` | **clean** |
| `2026-10-20T15:59:47Z` | **clean** |
| `2026-10-21T22:10:37Z` | **defect** |

Note the runtime is attached at build time, so a site republished today picks up the new runtime regardless
of when its content last changed. Every page we have republished since 21 October carries the defect.

## Reproduction

The affected component is from your own **Ora** template — the home page two-up projects row, where
hovering one card grows it from `1fr` to `1.5fr` and shrinks its sibling.

1. Publish a site from the Ora template so it is served with the current runtime.
2. Load the home page and scroll to the very top.
3. Place the pointer where the left card will land — roughly a quarter across the window, a third of the
   way down — and **leave it stationary**.
4. Scroll down steadily so the row rises into the stationary pointer, causing the hover to begin as the row
   arrives.
5. Watch the **right-hand card's right edge** as the left card opens.

A vertical strip of the diagonal placeholder tile appears at that edge for roughly 250 ms.

**Hovering a card that has already settled does not reproduce it** — that path is clean on every runtime we
tested, which makes it a useful control.

In our project the row also carries a scroll-triggered variant switch that changes a layout property
(`padding: 15px` → `0`). Removing that difference so the two variants are layout-identical makes the defect
disappear entirely, which is the workaround we have shipped. We are not claiming to know why that is
sufficient — only that it is, reproducibly.

## Expected vs actual

**Expected:** throughout the animation, the child anchored with `justify-content: flex-end` keeps its right
edge coincident with the parent's right edge, as it does at both end states.

**Actual:** the child is positioned as though the parent were already at its final width, so the parent's
trailing edge runs ahead of it by exactly the amount the parent has still to shrink.

## Measurements

Sampled in a `requestAnimationFrame` loop on the published page, viewport 1536 × 950, Chromium.
`pVisual` is `getBoundingClientRect().width` on the parent (its animating visual box); `pLayout` is
`offsetWidth` on the same element (its final layout box).

```
 pVisual   pLayout   pVisual - pLayout   measured gap   child width   child offsetLeft
   742.5       596               146.5          145.9           894              -298
   714.8       596               118.8          118.4           894              -298
   683.9       596                87.9           87.7           894              -298
   658.5       596                62.5           62.3           894              -298
   648.2       596                52.2           52.1           894              -298
   634.7       596                38.7           38.6           894              -298
```

Two things to note:

1. **The gap equals `pVisual - pLayout` at every sample**, to within 0.6 px. The error is exactly the
   difference between the parent's current visual width and its final layout width.

2. **`child offsetLeft` is constant at `-298`**, which is `596 - 894` — the child's width subtracted from
   the parent's **final** width. Were it resolving against the visual box it would track `pVisual - 894`
   and change every frame. At the settled end state it does equal `pVisual - 894` and the gap is zero.

The child carries the expected inverse scale while this happens, e.g.
`matrix(0.833789, 0, 0, 1, -24.4407, 0)` — so the counter-scaling is being applied; it is the translate
that is computed from the wrong reference box.

Across three runtime versions with the identical interaction, the number of frames in which the parent was
actively scale-animating is the same, so the interaction ran equally in all three:

```
runtime 2026-10-19T21:45:06Z   scale-animating = 32   frames with a gap >  2px =  0
runtime 2026-10-20T15:59:47Z   scale-animating = 30   frames with a gap >  2px =  0
runtime 2026-10-21T22:10:37Z   scale-animating = 30   frames with a gap >  2px = 23
```

## How we isolated the runtime as the variable

We kept a copy of the published page from before and after the regression and served both locally, then ran
the identical measurement against each. The two builds differ in content by a single CSS rule; patching that
one rule forward into the older build did **not** reproduce the defect, and the newer build reproduces it
with or without that rule. The runtime version is the only variable that changes the outcome.

## Impact

- Any site using the Ora template's projects row, as published today.
- More generally, any component that animates a layout change by scaling a parent while a child is both
  anchored with `justify-content` and sized to overflow its parent. The "card masks a stationary image"
  pattern is the common case, and it fails in exactly the way that is most visible — the mask stops
  covering.
- The defect is silent: nothing is logged, the end states are correct, and it is invisible to any static
  check of the published CSS or markup because the faulty value is written by the animation at runtime.

## Contact

Happy to supply the before/after page captures, the measurement script, or a screen recording.
