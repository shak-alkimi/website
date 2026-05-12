import React, { ComponentType, useEffect, useState } from "react"

export function Twitter_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title) // Set the page title after component mounts
        }, [])

        return (
            <Component
                {...props}
                onTap={() => {
                    window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `Check out this insightful blog post: ${pageTitle}. Read it here:`
                        )}&url=${encodeURIComponent(window?.location?.href)}`
                    )
                }}
            />
        )
    }
}
export function LinkedIn_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title)
        }, [])

        return (
            <Component
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                            window?.location?.href
                        )}&title=${encodeURIComponent(
                            pageTitle
                        )}&source=framer.com`
                    )
                }}
                style={{
                    ...props.style,
                    cursor: "pointer",
                }}
            />
        )
    }
}

export function Facebook_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title)
        }, [])

        return (
            <Component
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            window?.location?.href
                        )}&quote=${encodeURIComponent(
                            `Check out this awesome site "${pageTitle}".`
                        )}`
                    )
                }}
            />
        )
    }
}

export function Email_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title)
        }, [])

        return (
            <Component
                {...props}
                onTap={() => {
                    const subject = encodeURIComponent(
                        `Check out this link: ${pageTitle}`
                    )
                    const body = encodeURIComponent(
                        `Hi,\n\nI wanted to share this link with you: ${window?.location?.href}`
                    )
                    window.open(`mailto:?subject=${subject}&body=${body}`)
                }}
            />
        )
    }
}

export function Clipboard_Share(Component): ComponentType {
    return (props) => {
        return (
            <Component
                {...props}
                onTap={() => {
                    const textField = document.createElement("textarea")
                    textField.innerText = window.location.href
                    document.body.appendChild(textField)
                    textField.select()
                    document.execCommand("copy")
                    textField.remove()
                    alert("URL copied to clipboard!")
                }}
            />
        )
    }
}

export function Whatsapp_Share(Component): ComponentType {
    return (props) => {
        return (
            <Component
                {...props}
                onTap={() => {
                    window.open(
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Check out this link: ${window?.location?.href}`
                        )}`
                    )
                }}
            />
        )
    }
}

export function Tumblr_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title)
        }, [])

        return (
            <Component
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(
                            window?.location?.href
                        )}&title=${encodeURIComponent(pageTitle)}`
                    )
                }}
            />
        )
    }
}
