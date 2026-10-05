// Create a Framer code component file named VideoThumbnail.tsx exporting a component named VideoThumbnail. It must accept a video file URL through a File property control titled “Video”, autoplay muted, loop continuously, and use playsInline. Render only the video with no poster image and no controls. Fill the entire Framer instance using width and height 100%, object-fit cover, display block, and inherit border radius/overflow cleanly from its canvas wrapper. Support Framer's style prop, use a transparent non-zero placeholder when no video is supplied, and remain SSR/canvas safe. The File control should allow MOV files; if Framer permits multiple extensions, include .mov only as requested.
import type { CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

interface MyComponentProps {
    video: string
    image?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function VideoThumbnail(props: MyComponentProps) {
    const {
        video = "",
        image = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Gradient 1 - Blue",
        },
        style,
    } = props

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "inherit",
                overflow: "hidden",
                ...style,
                pointerEvents: "none",
            }}
        >
            {video ? (
                <video
                    src={video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                        background: "#f7f6f2",
                        transform: "scale(1.15)",
                        transformOrigin: "center center",
                        display: "block",
                        borderRadius: "inherit",
                    }}
                />
            ) : image?.src ? (
                <img
                    src={image.src}
                    srcSet={image.srcSet}
                    alt={image.alt || ""}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "inherit",
                    }}
                />
            ) : (
                <div
                    aria-hidden="true"
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        background: "rgba(0, 0, 0, 0.001)",
                        borderRadius: "inherit",
                    }}
                />
            )}
        </div>
    )
}

addPropertyControls(VideoThumbnail, {
    video: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mov"],
    },
    image: {
        type: ControlType.ResponsiveImage,
        title: "image",
    },
})
