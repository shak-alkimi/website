// User request: Create a separate Framer code component named ElementsFilter.tsx that matches the Products filter style (horizontal compact pill tabs, black active pill, white inactive pills, rounded capsules, responsive overflow), renders exactly four options (All, Connector, Driver, LED), exposes an onFilterChange event handler, supports property controls, and does not modify existing files.
import { useCallback, useEffect, useMemo, useState, startTransition } from "react"
import { addPropertyControls, ControlType } from "framer"

interface MyComponentProps {
    initialFilter: "All" | "Connector" | "Driver" | "LED"
    background: string
    activeBackground: string
    inactiveTextColor: string
    activeTextColor: string
    borderColor: string
    tabFont: {
        fontSize?: number | string
        letterSpacing?: number | string
        lineHeight?: number | string
        fontWeight?: number
        fontStyle?: "normal" | "italic"
        fontFamily?: string
        textAlign?: "left" | "center" | "right"
    }
    horizontalPadding: number
    verticalPadding: number
    gap: number
    tabHorizontalPadding: number
    tabVerticalPadding: number
    radius: number
    onFilterChange?: (filter: string) => void
}

const FILTER_OPTIONS = ["All", "Connector", "Driver", "LED"] as const

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ElementsFilter(props: MyComponentProps) {
    const {
        initialFilter,
        background,
        activeBackground,
        inactiveTextColor,
        activeTextColor,
        borderColor,
        tabFont,
        horizontalPadding,
        verticalPadding,
        gap,
        tabHorizontalPadding,
        tabVerticalPadding,
        radius,
        onFilterChange,
    } = props

    const [activeFilter, setActiveFilter] = useState<string>(initialFilter || "All")

    useEffect(() => {
        startTransition(() => setActiveFilter(initialFilter || "All"))
    }, [initialFilter])

    const scrollContainerStyle = useMemo(
        () => ({
            position: "relative" as const,
            width: "100%",
            padding: `${verticalPadding}px ${horizontalPadding}px`,
            overflowX: "auto" as const,
            overflowY: "hidden" as const,
            whiteSpace: "nowrap" as const,
            WebkitOverflowScrolling: "touch" as const,
            scrollbarWidth: "none" as const,
            msOverflowStyle: "none" as const,
            background: "transparent",
        }),
        [horizontalPadding, verticalPadding]
    )

    const segmentedControlStyle = useMemo(
        () => ({
            display: "inline-flex",
            flexDirection: "row" as const,
            alignItems: "stretch" as const,
            gap: `${gap * 0}px`,
            border: `1px solid ${borderColor}`,
            borderRadius: `${radius}px`,
            overflow: "hidden" as const,
            background,
            minWidth: "max-content",
        }),
        [background, borderColor, gap, radius]
    )

    const handleFilterSelect = useCallback(
        (option: string) => {
            startTransition(() => setActiveFilter(option))
            if (onFilterChange) onFilterChange(option)
        },
        [onFilterChange]
    )

    return (
        <div style={scrollContainerStyle}>
            <div role="tablist" aria-label="Elements filter" style={segmentedControlStyle}>
                {FILTER_OPTIONS.map((option) => {
                    const isActive = option === activeFilter

                    return (
                        <button
                            key={option}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Filter by ${option}`}
                            onClick={() => handleFilterSelect(option)}
                            style={{
                                appearance: "none",
                                border: "none",
                                background: isActive ? activeBackground : background,
                                color: isActive ? activeTextColor : inactiveTextColor,
                                borderRadius: 0,
                                margin: 0,
                                padding: `${tabVerticalPadding}px ${tabHorizontalPadding}px`,
                                cursor: "pointer",
                                flex: "0 0 auto",
                                whiteSpace: "nowrap",
                                fontSize: tabFont.fontSize,
                                lineHeight: tabFont.lineHeight,
                                letterSpacing: tabFont.letterSpacing,
                                fontWeight: tabFont.fontWeight,
                                fontStyle: tabFont.fontStyle,
                                fontFamily: tabFont.fontFamily || "General Sans, sans-serif",
                                textAlign: tabFont.textAlign,
                                transition: "background-color 160ms ease, color 160ms ease",
                            }}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

addPropertyControls(ElementsFilter, {
    initialFilter: {
        type: ControlType.Enum,
        title: "Initial",
        options: ["All", "Connector", "Driver", "LED"],
        optionTitles: ["All", "Connector", "Driver", "LED"],
        defaultValue: "All",
    },
    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    activeBackground: {
        type: ControlType.Color,
        title: "Active BG",
        defaultValue: "#000000",
    },
    inactiveTextColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#000000",
    },
    activeTextColor: {
        type: ControlType.Color,
        title: "Active Text",
        defaultValue: "#FFFFFF",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#000000",
    },
    tabFont: {
        type: ControlType.Font,
        title: "Tab Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "14px",
            variant: "Medium",
            letterSpacing: "0em",
            lineHeight: "1",
        },
    },
    horizontalPadding: {
        type: ControlType.Number,
        title: "Pad X",
        defaultValue: 0,
        min: 0,
        max: 32,
        step: 1,
    },
    verticalPadding: {
        type: ControlType.Number,
        title: "Pad Y",
        defaultValue: 0,
        min: 0,
        max: 32,
        step: 1,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 0,
        min: 0,
        max: 24,
        step: 1,
    },
    tabHorizontalPadding: {
        type: ControlType.Number,
        title: "Tab Pad X",
        defaultValue: 20,
        min: 6,
        max: 32,
        step: 1,
    },
    tabVerticalPadding: {
        type: ControlType.Number,
        title: "Tab Pad Y",
        defaultValue: 7,
        min: 4,
        max: 20,
        step: 1,
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 999,
        min: 8,
        max: 999,
        step: 1,
    },
    onFilterChange: {
        type: ControlType.EventHandler,
    },
})