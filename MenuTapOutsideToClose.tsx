import { useEffect } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Two behaviours the full-screen navigation overlay needs that Framer cannot express
// on its own. Both live here because this component is already instanced inside both
// menu variants ("Variant 1" and "Desktop Full Menu"), so neither needs placing again.
//
// 1. TAP OUTSIDE TO CLOSE
//    Framer's overlay already has "Dismissible: Yes", but its dismiss backdrop sits at
//    z-index 6 and the menu's own content ("Menu Content") is full-bleed, so the backdrop
//    can never receive a tap and the setting has no effect. Rather than restructure the
//    menu, this reuses Framer's own dismissal path: Escape closes the overlay, and a
//    synthetic Escape keydown on document works. So a tap in the dead space is translated
//    into that keypress.
//
//    Taps on a nav row are ignored so links still navigate, and taps on the hamburger are
//    ignored so its own toggle keeps working. Only taps landing inside the open menu count,
//    so nothing elsewhere on the page is affected.
//
// 2. HOVER DIMS THE OTHER ROWS
//    Hovering one row holds it at full strength and fades the rest back. Framer's own
//    hover effects act on the layer being hovered, not on its siblings, so this cannot be
//    built in the editor — and it would otherwise need the effect applied by hand to five
//    rows across two variants, where none of it would be version-controlled.
//
//    It dims with `filter: opacity()` rather than the `opacity` property on purpose.
//    Framer writes `style="opacity: 1"` INLINE on these anchors as part of the menu's
//    appear animation, so an `opacity` rule would need `!important` to win — and that
//    would then also override the overlay's close animation, making the rows snap away
//    instead of fading. Framer sets no inline `filter`, so this composites alongside the
//    open/close animation instead of fighting it.
//
//    `:has()` scopes the dim to "a row is actually hovered", so moving through the gaps
//    between rows does not dim everything. Where `:has()` is unsupported the whole rule
//    is ignored and the menu simply behaves as it does today.

const MENU_CONTENT = '[data-framer-name="Menu Content"]'
const TOGGLE = '[data-framer-name*="Hamburger"], [data-framer-name*="Menu Button"]'
const STYLE_ID = "alkimi-menu-hover-dim"

// Matches the easing the menu dividers already draw with, so the two read as one system.
const DIM_EASING = "cubic-bezier(0.65, 0, 0.13, 1)"

interface MenuTapOutsideToCloseProps {
    enabled: boolean
    dimOnHover: boolean
    dimOpacity: number
    dimDuration: number
}

/**
 * @framerIntrinsicWidth 0
 * @framerIntrinsicHeight 0
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function MenuTapOutsideToClose(props: MenuTapOutsideToCloseProps) {
    const { enabled, dimOnHover, dimOpacity, dimDuration } = props
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    useEffect(() => {
        if (!enabled || isCanvas) return
        if (typeof window === "undefined" || typeof document === "undefined") return

        const onPointerUp = (event: PointerEvent) => {
            const target = event.target as Element | null
            if (!target || typeof target.closest !== "function") return

            // Only act on taps that land inside the open menu. "Menu Content" is only
            // in the DOM while the overlay is open, so this doubles as the open check.
            if (!target.closest(MENU_CONTENT)) return

            // A nav row — let it navigate. The overlay goes away with the page change.
            if (target.closest("a[href]")) return

            // The hamburger already toggles the overlay itself.
            if (target.closest(TOGGLE)) return

            document.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Escape",
                    code: "Escape",
                    keyCode: 27,
                    which: 27,
                    bubbles: true,
                    cancelable: true,
                })
            )
        }

        document.addEventListener("pointerup", onPointerUp, true)
        return () => document.removeEventListener("pointerup", onPointerUp, true)
    }, [enabled, isCanvas])

    useEffect(() => {
        if (!dimOnHover || isCanvas) return
        if (typeof document === "undefined") return

        // Pointer-only: a touch device would otherwise leave a row stuck dimmed after a tap.
        const css = [
            "@media (hover: hover) and (pointer: fine) {",
            "  " + MENU_CONTENT + " a[href] {",
            "    transition: filter " + dimDuration + "ms " + DIM_EASING + ";",
            "  }",
            "  " + MENU_CONTENT + ":has(a[href]:hover) a[href]:not(:hover) {",
            "    filter: opacity(" + dimOpacity + ");",
            "  }",
            "}",
        ].join("\n")

        const existing = document.getElementById(STYLE_ID)
        const style = existing || document.createElement("style")
        style.id = STYLE_ID
        style.textContent = css
        if (!existing) document.head.appendChild(style)

        return () => {
            const el = document.getElementById(STYLE_ID)
            if (el && el.parentNode) el.parentNode.removeChild(el)
        }
    }, [dimOnHover, dimOpacity, dimDuration, isCanvas])

    return (
        <div
            aria-hidden="true"
            style={{
                position: "relative",
                width: 0,
                height: 0,
                overflow: "hidden",
                pointerEvents: "none",
            }}
        />
    )
}

MenuTapOutsideToClose.defaultProps = {
    enabled: true,
    dimOnHover: true,
    dimOpacity: 0.35,
    dimDuration: 320,
}

addPropertyControls(MenuTapOutsideToClose, {
    enabled: {
        type: ControlType.Boolean,
        title: "Tap to close",
        defaultValue: true,
    },
    dimOnHover: {
        type: ControlType.Boolean,
        title: "Dim on hover",
        defaultValue: true,
    },
    dimOpacity: {
        type: ControlType.Number,
        title: "Dim to",
        defaultValue: 0.35,
        min: 0,
        max: 1,
        step: 0.05,
        displayStepper: true,
        hidden: ({ dimOnHover }) => !dimOnHover,
    },
    dimDuration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 320,
        min: 0,
        max: 1000,
        step: 20,
        unit: "ms",
        hidden: ({ dimOnHover }) => !dimOnHover,
    },
})
