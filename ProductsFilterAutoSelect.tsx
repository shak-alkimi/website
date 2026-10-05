import { forwardRef, useEffect, type ComponentType } from "react"

export function withProductsFilterAutoSelect(Component): ComponentType {
    return forwardRef(function WithProductsFilterAutoSelect(props: any, ref) {
        useEffect(() => {
            if (typeof window === "undefined" || typeof document === "undefined") {
                return
            }

            const pendingFilter = window.sessionStorage.getItem("products-filter")
            if (pendingFilter !== "Elements") return

            window.sessionStorage.removeItem("products-filter")

            const timeoutId = window.setTimeout(() => {
                const elements = Array.from(
                    document.querySelectorAll<HTMLElement>("*")
                )
                const target = elements.find((element) => {
                    const text = element.textContent?.trim()
                    const visible =
                        !!(
                            element.offsetWidth ||
                            element.offsetHeight ||
                            element.getClientRects().length
                        ) && element.getAttribute("aria-hidden") !== "true"
                    return visible && text === "Elements"
                })

                if (target) target.click()
            }, 120)

            return () => {
                window.clearTimeout(timeoutId)
            }
        }, [])

        return <Component ref={ref} {...props} />
    })
}