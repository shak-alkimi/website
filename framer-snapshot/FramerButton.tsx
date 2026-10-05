import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function FramerButton(props) {
    const { horizontal, vertical } = props

    const cssContent = `
    #__framer-badge-container {
      ${
          horizontal === "left"
              ? "z-index: -500 !important;"
              : "z-index: -500 !important;"
      }
      ${vertical === "top" ? "top: 0 !important;" : "bottom: 0 !important;"}
    }
  `

    React.useEffect(() => {
        const styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = cssContent
        document.head.appendChild(styleSheet)

        const intervalId = setInterval(() => {
            const badgeContainer = document.querySelector(
                "#__framer-badge-container"
            )
            if (badgeContainer) {
                const framerLink = badgeContainer.querySelector(
                    "a[href='https://framer.com/?via=ena_studio']"
                )
                if (framerLink) {
                    framerLink.href = "https://www.framer.com/?via=ena_studio"
                    clearInterval(intervalId)
                }
            }
        }, 500)

        return () => {
            document.head.removeChild(styleSheet)
            clearInterval(intervalId)
        }
    }, [horizontal, vertical])

    return <motion.div></motion.div>
}
