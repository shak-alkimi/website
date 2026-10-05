import type { ComponentType } from "react"
import { useEffect, useRef } from "react"

// Counts the items in a sibling Collection List and rewrites this text layer
// as "{n} {noun}". The list is located by its Framer layer name, which Framer
// renders as data-framer-name — so this stays scoped to the section (and the
// breakpoint) the count actually lives in, rather than guessing at context the
// way OpticProductCount does.

const MAX_ANCESTORS = 12

function createCountOverride(
    listName: string,
    singular: string,
    plural: string
) {
    return (Component: ComponentType): ComponentType => {
        return (props: any) => {
            const wrapRef = useRef<HTMLSpanElement>(null)

            useEffect(() => {
                const wrap = wrapRef.current
                if (!wrap) return
                const target = wrap.firstElementChild as HTMLElement | null
                if (!target) return

                // Walk up from this text layer; the first ancestor that
                // contains the named list wins. That keeps Connector/Driver/LED
                // reading their own list instead of the first one on the page.
                const findList = (): HTMLElement | null => {
                    let el: HTMLElement | null = wrap
                    for (let i = 0; i < MAX_ANCESTORS && el; i++) {
                        const hit = el.querySelector(
                            `[data-framer-name="${listName}"]`
                        )
                        if (hit) return hit as HTMLElement
                        el = el.parentElement
                    }
                    return null
                }

                // Framer renders one child per collection item at this level.
                // Do NOT descend when there is a single child — that is a real
                // one-item list, and descending counts the item's own parts.
                const countItems = (list: HTMLElement): number =>
                    list.children.length

                // Write into the existing text node rather than setting
                // textContent. Framer nests the styled <span> inside the text
                // layer; replacing textContent strips it and the count loses
                // the layer's font, size and weight.
                const writeText = (root: HTMLElement, value: string) => {
                    const walker = document.createTreeWalker(
                        root,
                        NodeFilter.SHOW_TEXT
                    )
                    const node = walker.nextNode()
                    if (node) {
                        if (node.nodeValue !== value) node.nodeValue = value
                    } else if (root.textContent !== value) {
                        root.textContent = value
                    }
                }

                const update = () => {
                    const list = findList()
                    if (!list) return
                    const n = countItems(list)
                    writeText(target, `${n} ${n === 1 ? singular : plural}`)
                }

                update()
                const raf = requestAnimationFrame(update)
                const t1 = setTimeout(update, 200)
                const t2 = setTimeout(update, 1000)

                // Re-run when the filter shows/hides sections or the list
                // re-renders. The guard above makes this self-terminating.
                const observer = new MutationObserver(update)
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                })

                return () => {
                    cancelAnimationFrame(raf)
                    clearTimeout(t1)
                    clearTimeout(t2)
                    observer.disconnect()
                }
            }, [])

            return (
                <span ref={wrapRef} style={{ display: "contents" }}>
                    <Component {...props} />
                </span>
            )
        }
    }
}

// Framer only lists overrides exported as function declarations.
export function withConnectorCount(Component: ComponentType): ComponentType {
    return createCountOverride(
        "Connector List",
        "connector",
        "connectors"
    )(Component)
}

export function withDriverCount(Component: ComponentType): ComponentType {
    return createCountOverride("Driver List", "driver", "drivers")(Component)
}

export function withLEDCount(Component: ComponentType): ComponentType {
    return createCountOverride("LED List", "LED", "LED")(Component)
}

// /products — replaces OpticProductCount, which returns 0 in the published
// build and strips the text layer's styling. Wording matches what that page
// already used: "3 flexible", "5 profiles", "3 optics".
export function withFlexCount(Component: ComponentType): ComponentType {
    return createCountOverride("Flex List", "flexible", "flexible")(Component)
}

export function withProfileCount(Component: ComponentType): ComponentType {
    return createCountOverride("Profile List", "profile", "profiles")(Component)
}

export function withOpticCount(Component: ComponentType): ComponentType {
    return createCountOverride("Optic List", "optic", "optics")(Component)
}
