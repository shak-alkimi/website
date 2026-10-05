import { forwardRef, useCallback, type ComponentType } from "react"

export function withElementsProductsLink(Component): ComponentType {
    return forwardRef(function WithElementsProductsLink(props: any, ref) {
        const handleNavigate = useCallback(
            (event: any) => {
                if (typeof props.onTap === "function") props.onTap(event)
                if (typeof props.onClick === "function") props.onClick(event)

                if (typeof window !== "undefined") {
                    window.sessionStorage.setItem("products-filter", "Elements")
                    window.location.href = "/products"
                }
            },
            [props]
        )

        return (
            <Component
                ref={ref}
                {...props}
                onTap={handleNavigate}
                onClick={handleNavigate}
                style={{ ...props.style, cursor: props.style?.cursor ?? "pointer" }}
            />
        )
    })
}