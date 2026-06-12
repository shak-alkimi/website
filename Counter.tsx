import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

export function NumberCounter(props) {
    const {
        startNumber = 0,
        endNumber = 10,
        fontColor = "#000",
        fontSize = 16,
        fontWeight = "normal",
        fontFamily = "Arial",
        speed = 100,
        prefix = "",
        suffix = "",
        loop = false,
    } = props
    const [count, setCount] = useState(startNumber)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const observer = new IntersectionObserver((entries) => {
            setIsVisible(entries[0].isIntersecting)
        })
        observer.observe(node)

        return () => {
            observer.unobserve(node)
        }
    }, [])

    useEffect(() => {
        if (!isVisible || startNumber === endNumber) return

        const step = endNumber > startNumber ? 1 : -1
        const intervalId = setInterval(() => {
            setCount((prev) => {
                if (prev === endNumber) {
                    if (loop) return startNumber
                    clearInterval(intervalId)
                    return prev
                }
                const next = prev + step
                // Clamp so non-integer ranges still terminate exactly on endNumber
                if (step > 0 ? next > endNumber : next < endNumber) {
                    return endNumber
                }
                return next
            })
        }, Math.max(speed, 10))

        return () => {
            clearInterval(intervalId)
        }
    }, [isVisible, startNumber, endNumber, loop, speed])

    return (
        <motion.div
            ref={ref}
            style={{
                color: fontColor,
                fontSize: fontSize,
                fontWeight: fontWeight,
                fontFamily: fontFamily,
            }}
        >
            {prefix}
            {count}
            {suffix}
        </motion.div>
    )
}

addPropertyControls(NumberCounter, {
    startNumber: {
        type: ControlType.Number,
        title: "Start Number",
        defaultValue: 0,
        displayStepper: true,
    },
    endNumber: {
        type: ControlType.Number,
        title: "End Number",
        defaultValue: 10,
        displayStepper: true,
    },
    fontColor: {
        type: ControlType.Color,
        title: "Font Color",
        defaultValue: "#000",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 16,
        min: 0,
        max: 100,
        step: 1,
    },
    fontWeight: {
        type: ControlType.Enum,
        title: "Font Weight",
        defaultValue: "normal",
        options: ["light", "normal", "medium", "semibold", "bold"],
        optionTitles: ["Light", "Regular", "Medium", "Semibold", "Bold"],
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue: "Arial",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed (ms)",
        defaultValue: 100,
        min: 10,
        max: 1000,
        step: 10,
    },
    prefix: {
        type: ControlType.String,
        title: "Prefix",
        defaultValue: "",
    },
    suffix: {
        type: ControlType.String,
        title: "Suffix",
        defaultValue: "",
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop Animation",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
})
