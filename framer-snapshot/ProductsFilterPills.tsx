// User request: Update ProductsFilterPills.tsx so clicking any option updates the current page URL query parameter `filter` using the option value (without requiring link props), while preserving existing styling and option sets.
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    startTransition,
} from "react"
import { addPropertyControls, ControlType } from "framer"

interface MyComponentProps {
    optionSet: "Elements" | "Fixtures"
    activeOption: string
    onFilterChange?: () => void
    onAll?: () => void
    onConnector?: () => void
    onDriver?: () => void
    onLED?: () => void
    onFlex?: () => void
    onProfile?: () => void
    onOptic?: () => void
    enableLinks: boolean
    allLink: string
    connectorLink: string
    driverLink: string
    ledLink: string
    profileLink: string
    flexLink: string
    opticLink: string
    background: string
    primary: string
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
    tabHorizontalPadding: number
    tabVerticalPadding: number
    radius: number
}

const ELEMENTS_FILTER_OPTIONS = ["All", "Connector", "Driver", "LED"] as const
const FIXTURES_FILTER_OPTIONS = ["All", "Flex", "Profile", "Optic"] as const

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ProductsFilterPills(props: MyComponentProps) {
    const {
        optionSet,
        activeOption,
        onFilterChange,
        onAll,
        onConnector,
        onDriver,
        onLED,
        onFlex,
        onProfile,
        onOptic,
        enableLinks,
        allLink,
        connectorLink,
        driverLink,
        ledLink,
        profileLink,
        flexLink,
        opticLink,
        background,
        primary,
        borderColor,
        tabFont,
        tabHorizontalPadding,
        tabVerticalPadding,
        radius,
    } = props

    const filterOptions = useMemo<string[]>(
        () =>
            optionSet === "Fixtures"
                ? [...FIXTURES_FILTER_OPTIONS]
                : [...ELEMENTS_FILTER_OPTIONS],
        [optionSet]
    )

    const resolvedActiveOption = useMemo(
        () => (filterOptions.includes(activeOption) ? activeOption : "All"),
        [activeOption, filterOptions]
    )

    const [selected, setSelected] = useState<string>(resolvedActiveOption)

    useEffect(() => {
        startTransition(() => setSelected(resolvedActiveOption))
    }, [resolvedActiveOption])

    const linksMap = useMemo(
        () => ({
            All: allLink,
            Connector: connectorLink,
            Driver: driverLink,
            LED: ledLink,
            Profile: profileLink,
            Flex: flexLink,
            Optic: opticLink,
        }),
        [
            allLink,
            connectorLink,
            driverLink,
            ledLink,
            profileLink,
            flexLink,
            opticLink,
        ]
    )

    const handleOptionClick = useCallback(
        (option: string) => {
            startTransition(() => setSelected(option))
            if (option === "All" && onAll) onAll()
            if (option === "Connector" && onConnector) onConnector()
            if (option === "Driver" && onDriver) onDriver()
            if (option === "LED" && onLED) onLED()
            if (option === "Flex" && onFlex) onFlex()
            if (option === "Profile" && onProfile) onProfile()
            if (option === "Optic" && onOptic) onOptic()
            if (onFilterChange) onFilterChange()

            if (typeof window !== "undefined") {
                const nextUrl = new URL(window.location.href)
                nextUrl.searchParams.set("filter", option)
                window.history.pushState({}, "", nextUrl.toString())
                window.dispatchEvent(new PopStateEvent("popstate"))
            }

            const destination = linksMap[option]
            if (
                enableLinks &&
                destination &&
                typeof window !== "undefined" &&
                destination.trim().length > 0
            ) {
                window.location.href = destination
            }
        },
        [
            enableLinks,
            linksMap,
            onAll,
            onConnector,
            onDriver,
            onFilterChange,
            onLED,
            onFlex,
            onProfile,
            onOptic,
        ]
    )

    const outerStyle = useMemo(
        () => ({
            position: "relative" as const,
            width: "100%",
            overflowX: "auto" as const,
            overflowY: "hidden" as const,
            whiteSpace: "nowrap" as const,
            scrollbarWidth: "none" as const,
            msOverflowStyle: "none" as const,
            WebkitOverflowScrolling: "touch" as const,
        }),
        []
    )

    const segmentedStyle = useMemo(
        () => ({
            display: "inline-flex",
            alignItems: "center",
            minWidth: "max-content",
            border: `1px solid ${borderColor}`,
            borderRadius: radius,
            overflow: "hidden" as const,
            background,
        }),
        [background, borderColor, radius]
    )

    return (
        <div style={outerStyle}>
            <div
                role="tablist"
                aria-label="Products filter"
                style={segmentedStyle}
            >
                {filterOptions.map((option) => {
                    const isActive = selected === option
                    return (
                        <button
                            key={option}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Filter by ${option}`}
                            onClick={() => handleOptionClick(option)}
                            style={{
                                appearance: "none",
                                border: "none",
                                background: isActive ? primary : background,
                                color: isActive ? background : primary,
                                padding: `${tabVerticalPadding}px ${tabHorizontalPadding}px`,
                                margin: 0,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                fontSize: tabFont.fontSize,
                                lineHeight: tabFont.lineHeight,
                                letterSpacing: tabFont.letterSpacing,
                                fontWeight: tabFont.fontWeight,
                                fontStyle: tabFont.fontStyle,
                                fontFamily: tabFont.fontFamily,
                                textAlign: tabFont.textAlign,
                                transition:
                                    "background-color 160ms ease, color 160ms ease",
                                flex: "0 0 auto",
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

addPropertyControls(ProductsFilterPills, {
    optionSet: {
        type: ControlType.Enum,
        title: "Option Set",
        options: ["Elements", "Fixtures"],
        optionTitles: ["Elements", "Fixtures"],
        defaultValue: "Elements",
    },
    activeOption: {
        type: ControlType.Enum,
        title: "Active",
        options: [
            "All",
            "Connector",
            "Driver",
            "LED",
            "Profile",
            "Flex",
            "Optic",
        ],
        optionTitles: [
            "All",
            "Connector",
            "Driver",
            "LED",
            "Profile",
            "Flex",
            "Optic",
        ],
        defaultValue: "All",
    },
    onFilterChange: {
        type: ControlType.EventHandler,
    },
    onAll: {
        type: ControlType.EventHandler,
    },
    onConnector: {
        type: ControlType.EventHandler,
    },
    onDriver: {
        type: ControlType.EventHandler,
    },
    onLED: {
        type: ControlType.EventHandler,
    },
    onFlex: {
        type: ControlType.EventHandler,
    },
    onProfile: {
        type: ControlType.EventHandler,
    },
    onOptic: {
        type: ControlType.EventHandler,
    },
    enableLinks: {
        type: ControlType.Boolean,
        title: "Links",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    allLink: {
        type: ControlType.Link,
        title: "All Link",
        defaultValue: "",
        hidden: (props) => !props.enableLinks,
    },
    connectorLink: {
        type: ControlType.Link,
        title: "Connector",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Elements",
    },
    driverLink: {
        type: ControlType.Link,
        title: "Driver",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Elements",
    },
    ledLink: {
        type: ControlType.Link,
        title: "LED",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Elements",
    },
    profileLink: {
        type: ControlType.Link,
        title: "Profile",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Fixtures",
    },
    flexLink: {
        type: ControlType.Link,
        title: "Flex",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Fixtures",
    },
    opticLink: {
        type: ControlType.Link,
        title: "Optic",
        defaultValue: "",
        hidden: (props) => !props.enableLinks || props.optionSet !== "Fixtures",
    },
    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    primary: {
        type: ControlType.Color,
        title: "Primary",
        defaultValue: "#000000",
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
            variant: "Semibold",
            letterSpacing: "-0.01em",
            lineHeight: "1em",
        },
    },
    tabHorizontalPadding: {
        type: ControlType.Number,
        title: "Tab X",
        defaultValue: 20,
        min: 6,
        max: 32,
        step: 1,
    },
    tabVerticalPadding: {
        type: ControlType.Number,
        title: "Tab Y",
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
})
