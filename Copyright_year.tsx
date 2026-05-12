import type { ComponentType } from "react"

export function AutoCopyrightStatement(Component): ComponentType {
    return (props) => {
        const textProps = props.children?.props?.children?.props
        if (textProps && typeof textProps.children == "string") {
            textProps.children = textProps.children.replace(
                "YYYY",
                new Date().getFullYear()
            )
        }
        return <Component {...props} />
    }
}
