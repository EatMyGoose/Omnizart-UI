import React from "react";
import "html-midi-player"
import { PlayerElement } from "html-midi-player";

export interface IMidiPlayer
{
    src: string,
    soundFont: string
    visualizer?: string
    className?: string
}

export const MidiPlayer = React.forwardRef(
    (props: IMidiPlayer, ref: React.ForwardedRef<PlayerElement>) => 
    {
        return React.createElement(
            "midi-player",
            {
                src: props.src,
                "sound-font": props.soundFont,
                visualizer: props.visualizer,
                ref: ref,
                class: props.className || "",
            }
        );
    }
);