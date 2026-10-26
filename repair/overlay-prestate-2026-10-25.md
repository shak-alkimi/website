# `Home - Projects Row` (`z64WCa5DN`) — Overlay geometry BEFORE the 2026-10-25 pin-all-edges fix

Captured read-only before any write. `c3zoHl4nJ` is the RIGHT card's overlay, `BuucDdzGc` the LEFT
card's (established from the published CSS: in `Left Open` it is the right overlay that takes
`right:0; width:150%`).

The defect: the overlay's positioning MODE changed between variants — centred at `width:100%` at rest,
edge-anchored at `width:150%` in the open states. A mode change cannot animate coherently, so while a
card was SHRINKING its overlay reached the target size early and left a wedge of card ungraded for the
length of the spring. Only visible on the shrinking card; on the growing one an over-wide overlay is
clipped by `overflow:hidden`.

Fix applied: every Overlay pinned `left/right/top/bottom = 0px` with `width/height/centerX/centerY`
cleared, so its size is DERIVED from the card and is identical in every variant — nothing to animate.
Safe because the gradient is `linear-gradient(180deg, …)`, purely vertical, so horizontal size has no
visual effect as long as it covers.

| variant | node | pre-state |
|---|---|---|
| Home Projects - Initial State | `c3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Initial State | `BuucDdzGc` | W=100% H=100% cX=50% cY=50% |
| Home Projects Left Open | `oPpHV0t6gc3zoHl4nJ` | **R=0px B=0px W=150% H=100%** |
| Home Projects Left Open | `oPpHV0t6gBuucDdzGc` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Right Open | `NUBSYIVHkc3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Right Open | `NUBSYIVHkBuucDdzGc` | **L=0px B=0px W=150% H=100%** |
| Before Scroll State - Below Hero | `e4pb_2_xkc3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Before Scroll State - Below Hero | `e4pb_2_xkBuucDdzGc` | W=100% H=100% cX=50% cY=50% |
| Home Project Single - Wide | `mtMqiJV1sc3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Project Single - Wide | `mtMqiJV1sBuucDdzGc` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Tablet | `bn4UIWDSxc3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Tablet | `bn4UIWDSxBuucDdzGc` | L=0px B=0px W=100% H=100% |
| Home Projects - Mobile | `Uv47Ka9s5c3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Mobile | `Uv47Ka9s5BuucDdzGc` | L=0px B=0px W=100% H=100% |
| Home Project Single Wide - Mobile | `L4JpmcNboc3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Project Single Wide - Mobile | `L4JpmcNboBuucDdzGc` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Tablet Below Hero | `MF8bg8Wk5c3zoHl4nJ` | W=100% H=100% cX=50% cY=50% |
| Home Projects - Tablet Below Hero | `MF8bg8Wk5BuucDdzGc` | W=100% H=100% cX=50% cY=50% |

**`Home - Projects Row 2` (`QOhH3GYAD`) was deliberately NOT changed.** Its two-up variants render
nowhere (it serves only the Home wide card, which does not resize on hover), so it cannot show this
defect, and the standing precedent is not to touch unrendered paths. Its overlays still carry the old
mixed modes (`100%` / `120%` / `150%`, mixed anchors) if they are ever brought into use.
