import React from "react"
import "html-midi-player"
import { VisualizerElement } from "html-midi-player";
import "./MidiVisualizer.css"
import { cx } from "../util";

interface IMidiVisualizer
{
    id: string,
    type: "piano-roll" | "waterfall" | "staff",
    className?: string,
    style?: React.CSSProperties
    src?: string
}

export const MidiVisualizer = React.forwardRef(
    (props: IMidiVisualizer, ref: React.ForwardedRef<VisualizerElement>) => 
    {
        return React.createElement(
            "midi-visualizer",
            {
                id: props.id,
                type: props.type,
                class: props.className,
                style: props.style,
                src: props.src,

                ref:ref
            }
        );
    }
);