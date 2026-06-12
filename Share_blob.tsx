import React, { ComponentType, useEffect, useState } from "react"

const POPUP_OPTS = "noopener,noreferrer"

function showCopiedNotice() {
    const note = document.createElement("div")
    note.textContent = "Link copied"
    Object.assign(note.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 16px",
        background: "#252320",
        color: "#EAEAE7",
        borderRadius: "6px",
        fontSize: "14px",
        zIndex: "9999",
        pointerEvents: "none",
    })
    document.body.appendChild(note)
    setTimeout(() => note.remove(), 1500)
}

export function Twitter_Share(Component): ComponentType {
    return (props) => {
        const [pageTitle, setPageTitle] = useState("")

        useEffect(() => {
            setPageTitle(document.title) // Set the page title after component mounts
        }, [])

        return (
            <Component
                aria-label="Share on X"
                {...props}
                onTap={() => {
                    window.open(
                        `https://x.com/intent/tweet?text=${encodeURIComponent(
                            `Check out this insightful blog post: ${pageTitle}. Read it here:`
                        )}&url=${encodeURIComponent(window?.location?.href)}`,
                        "_blank",
                        POPUP_OPTS
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
                aria-label="Share on LinkedIn"
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                            window?.location?.href
                        )}&title=${encodeURIComponent(pageTitle)}`,
                        "_blank",
                        POPUP_OPTS
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
                aria-label="Share on Facebook"
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            window?.location?.href
                        )}&quote=${encodeURIComponent(
                            `Check out this awesome site "${pageTitle}".`
                        )}`,
                        "_blank",
                        POPUP_OPTS
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
                aria-label="Share via email"
                {...props}
                onTap={() => {
                    const subject = encodeURIComponent(
                        `Check out this link: ${pageTitle}`
                    )
                    const body = encodeURIComponent(
                        `Hi,\n\nI wanted to share this link with you: ${window?.location?.href}`
                    )
                    window.open(
                        `mailto:?subject=${subject}&body=${body}`,
                        "_blank",
                        POPUP_OPTS
                    )
                }}
            />
        )
    }
}

export function Clipboard_Share(Component): ComponentType {
    return (props) => {
        return (
            <Component
                aria-label="Copy link to clipboard"
                {...props}
                onTap={() => {
                    const url = window.location.href
                    if (navigator.clipboard?.writeText) {
                        navigator.clipboard
                            .writeText(url)
                            .then(showCopiedNotice)
                            .catch(() => {})
                    } else {
                        const textField = document.createElement("textarea")
                        textField.value = url
                        document.body.appendChild(textField)
                        textField.select()
                        document.execCommand("copy")
                        textField.remove()
                        showCopiedNotice()
                    }
                }}
            />
        )
    }
}

export function Whatsapp_Share(Component): ComponentType {
    return (props) => {
        return (
            <Component
                aria-label="Share on WhatsApp"
                {...props}
                onTap={() => {
                    window.open(
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Check out this link: ${window?.location?.href}`
                        )}`,
                        "_blank",
                        POPUP_OPTS
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
                aria-label="Share on Tumblr"
                {...props}
                onTap={() => {
                    window.open(
                        `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(
                            window?.location?.href
                        )}&title=${encodeURIComponent(pageTitle)}`,
                        "_blank",
                        POPUP_OPTS
                    )
                }}
            />
        )
    }
}
