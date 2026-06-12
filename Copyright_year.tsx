import { cloneElement, isValidElement } from "react"
import type { ComponentType } from "react"

export function AutoCopyrightStatement(Component): ComponentType {
    return (props) => {
        const outer = props.children
        const inner = outer?.props?.children
        const text = inner?.props?.children

        if (
            isValidElement(outer) &&
            isValidElement(inner) &&
            typeof text === "string"
        ) {
            const updatedInner = cloneElement(inner, {
                children: text.replace(
                    "YYYY",
                    String(new Date().getFullYear())
                ),
            })
            const updatedOuter = cloneElement(outer, {
                children: updatedInner,
            })
            return <Component {...props}>{updatedOuter}</Component>
        }

        return <Component {...props} />
    }
}
