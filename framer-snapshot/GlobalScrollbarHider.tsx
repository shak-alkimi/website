import { useCallback, useEffect, useMemo } from "react"
import { addPropertyControls } from "framer"

// Create a new minimal Framer code component named GlobalScrollbarHider. Its only responsibility is to inject a global browser style that hides document/page scrollbars across Chrome, Safari, Firefox, and legacy Edge while preserving scrolling. Use a guarded client-side effect to add a single style element to document.head and remove it on unmount. It should render an inert, zero-size element and be safe in canvas, preview, and published site. No visible UI or configurable controls are needed.

interface MyComponentProps {}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function GlobalScrollbarHider(props: MyComponentProps) {
    void props
    const styleElementId = useMemo(() => "framer-global-scrollbar-hider-style", [])

    const getScrollbarCss = useCallback((): string => {
        return `
html, body {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
}
`
    }, [])

    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") return

        const existing = document.getElementById(styleElementId) as HTMLStyleElement | null
        let styleNode = existing
        let createdByComponent = false

        if (!styleNode) {
            styleNode = document.createElement("style")
            styleNode.id = styleElementId
            styleNode.type = "text/css"
            styleNode.textContent = getScrollbarCss()
            document.head.appendChild(styleNode)
            createdByComponent = true
        }

        return () => {
            if (createdByComponent && styleNode?.parentNode) {
                styleNode.parentNode.removeChild(styleNode)
            }
        }
    }, [getScrollbarCss, styleElementId])

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

addPropertyControls(GlobalScrollbarHider, {})