import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

export function NumberCounter(props) {
    const {
        startNumber,
        endNumber,
        fontColor,
        fontSize,
        fontWeight,
        fontFamily,
        speed,
        prefix,
        suffix,
        loop,
    } = props
    const [count, setCount] = useState(startNumber)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            setIsVisible(entry.isIntersecting)
        })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    useEffect(() => {
        if (isVisible && startNumber !== endNumber) {
            const intervalId = setInterval(() => {
                if (count < endNumber) {
                    setCount((prevCount) => prevCount + 1)
                } else if (loop) {
                    setCount(startNumber)
                }
            }, speed)

            return () => {
                clearInterval(intervalId)
            }
        }
    }, [count, startNumber, endNumber, loop, isVisible])

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

NumberCounter.defaultProps = {
    startNumber: 0,
    endNumber: 10,
    fontColor: "#000",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Arial",
    speed: 100,
    prefix: "",
    suffix: "",
    loop: false,
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
        options: ["light", "normal", "italic", "medium", "semibold", "bold"],
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
        min: 0,
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
