# Line drawings — pen-width spec for the renderer (2026-10-20)

Outbound message to the original exporter, covering the twelve `Revision Round E-1 … E-12`
files in `…/Framer/Products/Product Lines/Web Ready`.

## Why

The pen width was set in absolute units while the camera distance varied between drawings.
Every file carries roughly the same pen in pixels (~1–2.5 px) while the products render
anywhere from ~1,088 to 5,730 px across, so the ones rendered large have a proportionally
thinner line and it disappears at web size.

## The number the first draft got wrong

An earlier draft prescribed a single figure — pen = 0.16% of the product's longest dimension.
**That is correct for the extrusions and wrong for nine of the twelve.** The required figure
ranges **0.131% to 0.826%**, a 6.3× spread, because the drawings do not all render at the same
size on the page: a small cross-section is placed large in its card and needs a proportionally
fatter pen, while a long extrusion is placed small and needs a thin one.

"Longest dimension" also means two different things across this batch. E-3 is a flat 2D profile
where the bounding box *is* the part; E-8 is an isometric run where the longest dimension is
however much extrusion happens to be drawn. One percentage cannot normalise both.

So the spec is per file, and the multiplier column is the better primary instruction — it needs
no measurement at their end and removes any chance of disagreeing about where the bbox falls.

## Measured targets

Current stroke measured as a percentage of each product's longest dimension at native
resolution; target is the same measure taken from the live drawing each file replaces.

| file | product | your pen × | target % of product | current % |
|---|---|---|---|---|
| E-1 | Prisma Multiplier | 1.33 | 0.131% | 0.0988% |
| E-2 | Vena Round Mini | 3.21 | 0.528% | 0.1646% |
| E-3 | Vena Corner Mini | 3.93 | 0.826% | 0.2101% |
| E-4 | Vena Mini | 2.86 | 0.494% | 0.1727% |
| E-5 | Flow Straight | — | already correct | 0.1951% (target 0.1825%) |
| E-6 | Vena | 2.65 | 0.267% | 0.1008% |
| E-7 | Vena Corner | 2.64 | 0.283% | 0.1071% |
| E-8 | Flow Spine | 3.37 | 0.165% | 0.0490% |
| E-9 | Flow 20 | 2.22 | 0.408% | 0.1842% |
| E-10 | Liga T | 4.83 | 0.422% | 0.0874% |
| E-11 | Liga W | 4.82 | 0.462% | 0.0959% |
| E-12 | Driver 5-1 | 3.13 | 0.164% | 0.0524% |

**E-5 Flow Straight needs no change** — it is the one file already on spec, so "all twelve" is
wrong in either direction.

Four of the twelve have no counterpart in the live set and are not in scope for replacement:
Prisma Link 1, Prisma Link 2, Rima 5, Rima 10.

## Claims verified before sending

- **No metadata in the PNGs** — confirmed. Every file sampled goes `IHDR` straight to `IDAT`
  with no `tEXt` / `iTXt` / `zTXt` / `pHYs` chunk, so there is nothing identifying the tool.
  All are `7009×4955` (E-1…E-4 are `4956`), bit depth 8, colour type 6 (RGBA).
- **Flow Spine fusing risk** — confirmed, and correctly scoped to that one file. E-8 is a
  receding row of about ten mounting clips, each drawn with a doubled sheet-thickness line that
  compresses toward the far end; at ×3.37 those will fuse into solid bars. E-3, the file with
  the largest multiplier at ×3.93, is a clean 2D profile with generous spacing and is not at
  risk.

---

## The message

```
Subject: Line drawings — one spec change for the next batch

Hi [name],

The E-series line drawings came out beautifully, but we can't use eleven of the
twelve as delivered — the lines are too thin for web — and there's a simple
change that would stop it happening again.

The issue is that the pen width was set in absolute units while the camera
distance varied between drawings. Each file ended up with roughly the same pen
in pixels — about 1 to 2.5 px — but the products are rendered anywhere from
1,088 to 5,730 px across. So on the ones rendered large, the line is
proportionally five times thinner, and it disappears at web size.

Going forward, please set the pen **relative to the product, not the frame** —
but the right figure differs per drawing, because they sit at different sizes
on our page. Simplest version, if your camera distances are unchanged from this
batch: just multiply your current pen by the factor below.

  file  product              your pen x   target % of product
  E-1   Prisma Multiplier       1.33       0.131%
  E-2   Vena Round Mini         3.21       0.528%
  E-3   Vena Corner Mini        3.93       0.826%
  E-4   Vena Mini               2.86       0.494%
  E-5   Flow Straight           —          already correct, leave as is
  E-6   Vena                    2.65       0.267%
  E-7   Vena Corner             2.64       0.283%
  E-8   Flow Spine              3.37       0.165%
  E-9   Flow 20                 2.22       0.408%
  E-10  Liga T                  4.83       0.422%
  E-11  Liga W                  4.82       0.462%
  E-12  Driver 5-1              3.13       0.164%

Self-check, if you'd rather work from the percentage: measure the product's
longest dimension in pixels, multiply by the target above, and that's the pen
it should be. Please set it numerically rather than by eye — at these weights
the lines are only a pixel or two wide, and counting pixels across an
antialiased edge is out by 25-50%.

Three smaller things:

- **Opaque white background (#FFFFFF)**, not transparent. Saves us a
  flattening step.

- **Please don't change canvas size, camera, framing or scale.** Several of
  these bleed off the frame edge on purpose and our layout depends on it.

- **Watch for drawings where edges sit closer together than the pen.** The Flow
  Spine file is a receding row of about ten clips, so the sheet-metal thickness
  lines are only a few pixels apart on the far ones and a correctly-weighted
  pen will fuse them into solid bars. Where a part repeats, fewer repeats or a
  larger draw would fix it.

One request as well: **could you send over the source files, or let us know
what they're built in?** The PNGs carry no metadata at all, so we couldn't
re-export and would otherwise have to correct the line weight on the rasters
instead. Having the models would mean a one-parameter change next time rather
than a day's work.

Thanks — the drawings themselves are exactly right, it's only the weight.

[your name]
```
