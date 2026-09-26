import React, { ComponentType, forwardRef, useEffect, useRef } from "react"

/**
 * Opens /products with a product family preselected, e.g.
 *
 *     /products?filter=elements
 *
 * The filter row already drives everything through a Framer variable named
 * "Filter" (each pill runs a Set Variable action). Rather than reimplement that
 * visibility logic, this override replays a real pointer + click sequence on the
 * matching pill so Framer's own interaction runs and the pill state stays
 * truthful.
 *
 * Attach `withURLFilter` to the filter row on /products.
 */

const FILTER_ROW_ID = "product-filter-row"
const KNOWN_FILTERS = ["all", "profile", "flex", "optic", "elements"]
const DEFAULT_FILTER = "all"
const GIVE_UP_AFTER_MS = 8000

// The override is attached to the desktop, tablet and phone rows, and Framer
// routes on the client. Set once a pill has actually been activated, so a
// second breakpoint's copy doesn't fire again for the same navigation.
let handledHref: string | null = null

function readWantedFilter(): string | null {
    let raw: string | null = null
    try {
        raw = new URLSearchParams(window.location.search).get("filter")
    } catch {
        return null
    }
    if (!raw) return null

    const wanted = raw.trim().toLowerCase()
    // Anything we don't recognise is ignored, leaving the page on "All".
    if (!KNOWN_FILTERS.includes(wanted)) return null
    if (wanted === DEFAULT_FILTER) return null
    return wanted
}

function isVisible(el: Element): boolean {
    if (!(el instanceof HTMLElement)) return false
    return el.getClientRects().length > 0
}

// Last-resort guard. /products also has an "Elements" section heading, so a
// bare text match on the document would happily click the wrong thing. Only
// trust a label that sits with the rest of the filter names.
function looksLikeFilterRow(leaf: HTMLElement): boolean {
    let node: HTMLElement | null = leaf.parentElement
    let hops = 0
    while (node && hops < 4) {
        const text = (node.textContent || "").toLowerCase()
        if (KNOWN_FILTERS.every((name) => text.includes(name))) return true
        node = node.parentElement
        hops += 1
    }
    return false
}

// Most specific first: the row this override is attached to, then an explicit
// id if one has been set in Framer, then the whole document.
function searchScopes(rowEl: HTMLElement | null): Element[] {
    const found: Element[] = []
    if (rowEl) found.push(rowEl)
    const byId = document.getElementById(FILTER_ROW_ID)
    if (byId && byId !== rowEl) found.push(byId)
    if (document.body) found.push(document.body)
    return found
}

function findPill(wanted: string, rowEl: HTMLElement | null): HTMLElement | null {
    for (const scope of searchScopes(rowEl)) {
        const needsGuard = scope === document.body
        for (const el of Array.from(scope.querySelectorAll("*"))) {
            if (el.children.length !== 0) continue
            if ((el.textContent || "").trim().toLowerCase() !== wanted) continue
            // Visibility also picks the active breakpoint's row for us.
            if (!isVisible(el)) continue
            if (needsGuard && !looksLikeFilterRow(el as HTMLElement)) continue
            return el as HTMLElement
        }
    }
    return null
}

// Framer taps listen on pointer events, so a bare .click() can be ignored. The
// events bubble, so dispatching on the label reaches whichever ancestor holds
// the handler.
function activate(el: HTMLElement) {
    const opts = { bubbles: true, cancelable: true, composed: true }
    try {
        if (typeof window.PointerEvent === "function") {
            const pointer = {
                ...opts,
                isPrimary: true,
                button: 0,
                pointerId: 1,
                pointerType: "mouse",
            }
            el.dispatchEvent(new PointerEvent("pointerdown", pointer))
            el.dispatchEvent(new PointerEvent("pointerup", pointer))
        }
        el.dispatchEvent(new MouseEvent("mousedown", { ...opts, button: 0 }))
        el.dispatchEvent(new MouseEvent("mouseup", { ...opts, button: 0 }))
        el.dispatchEvent(new MouseEvent("click", { ...opts, button: 0 }))
    } catch {
        try {
            el.click()
        } catch {
            // Give up quietly — the page stays on its default filter.
        }
    }
}

export function withURLFilter(Component): ComponentType {
    return forwardRef(function WithURLFilter(props: any, forwardedRef: any) {
        const rowRef = useRef<HTMLElement | null>(null)

        const setRef = (node: HTMLElement | null) => {
            rowRef.current = node
            if (typeof forwardedRef === "function") forwardedRef(node)
            else if (forwardedRef) forwardedRef.current = node
        }

        useEffect(() => {
            if (
                typeof window === "undefined" ||
                typeof document === "undefined"
            ) {
                return
            }

            let finished = false
            let observer: MutationObserver | null = null
            let timeoutId = 0
            let frameId = 0

            const cleanup = () => {
                observer?.disconnect()
                observer = null
                if (timeoutId) window.clearTimeout(timeoutId)
                if (frameId) window.cancelAnimationFrame(frameId)
                timeoutId = 0
                frameId = 0
            }

            // Re-read the URL on every pass. On a client-side navigation the
            // row can mount before Framer's router has written the new
            // location, so reading it once and giving up loses the parameter.
            const attempt = () => {
                if (finished) return

                const href = window.location.href
                if (handledHref === href) {
                    finished = true
                    cleanup()
                    return
                }

                const wanted = readWantedFilter()
                if (!wanted) return

                const pill = findPill(wanted, rowRef.current)
                if (!pill) return

                handledHref = href
                finished = true
                cleanup()
                activate(pill)
            }

            const schedule = () => {
                if (finished) return
                if (frameId) window.cancelAnimationFrame(frameId)
                frameId = window.requestAnimationFrame(attempt)
            }

            schedule()
            observer = new MutationObserver(schedule)
            observer.observe(document.body, { childList: true, subtree: true })

            // If the row never turns up, or Framer's rendered structure
            // changes, stop looking instead of observing the document forever.
            timeoutId = window.setTimeout(() => {
                finished = true
                cleanup()
            }, GIVE_UP_AFTER_MS)

            return cleanup
        }, [])

        return <Component ref={setRef} {...props} />
    }) as unknown as ComponentType
}
