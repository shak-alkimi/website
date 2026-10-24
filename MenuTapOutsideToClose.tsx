import { useEffect } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Closes the mobile/desktop full-screen navigation overlay when the visitor taps
// the empty area around the menu rows.
//
// Framer's overlay already has "Dismissible: Yes", but its dismiss backdrop sits at
// z-index 6 and the menu's own content ("Menu Content") is full-bleed, so the backdrop
// can never receive a tap and the setting has no effect. Rather than restructure the
// menu, this reuses Framer's own dismissal path: Escape closes the overlay, and a
// synthetic Escape keydown on document works. So a tap in the dead space is translated
// into that keypress.
//
// Taps on a nav row are ignored so links still navigate, and taps on the hamburger are
// ignored so its own toggle keeps working. Only taps landing inside the open menu count,
// so nothing elsewhere on the page is affected.

const MENU_CONTENT = '[data-framer-name="Menu Content"]'
const TOGGLE = '[data-framer-name*="Hamburger"], [data-framer-name*="Menu Button"]'

interface MenuTapOutsideToCloseProps {
    enabled: boolean
}

/**
 * @framerIntrinsicWidth 0
 * @framerIntrinsicHeight 0
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function MenuTapOutsideToClose(props: MenuTapOutsideToCloseProps) {
    const { enabled } = props
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
}

addPropertyControls(MenuTapOutsideToClose, {
    enabled: {
        type: ControlType.Boolean,
        title: "Enabled",
        defaultValue: true,
    },
})
