import React from "react"
import { Button } from "../Components/Button";
import util from "../util.module.css"
import { MidiPlayer } from "../MidiPlayer";
import { MidiVisualizer } from "../MidiVisualizer";
import { PlayerElement, VisualizerElement } from "html-midi-player";
import 'material-icons/iconfont/material-icons.css';
import { cx } from "../util";

interface ITranscriptionResult
{
    midiFileURL?: string
    midiFilename?: string
    className?:string
}

export function TranscriptionResult(props: ITranscriptionResult)
{
    const midiDownloadRef = React.useRef<HTMLAnchorElement>(null);
    const playerRef = React.useRef<PlayerElement>(null);
    const visualizerRef = React.useRef<VisualizerElement>(null);

    React.useEffect(() => {
        if(playerRef.current && visualizerRef.current)
        {
          playerRef.current.addVisualizer(visualizerRef.current);
          return () => playerRef.current!.removeVisualizer(visualizerRef.current!);
        }
        return () => {};
    }, [playerRef.current, visualizerRef.current])

    const fileAvailable = props.midiFileURL !== undefined;

    return (
        <div className={props.className || ""}>
            <div className={util.flex_row}>
                <div className={cx(util.flex_row, util.centered, util.mx_1)}>
                    <a  
                        className={util.hidden} 
                        download={props.midiFilename || "transcribed"}
                        href={props.midiFileURL}
                        ref={midiDownloadRef}
                    />
                    <Button
                        onClick={() => midiDownloadRef.current?.click()}
                        className={cx(util.my_1)}
                        disabled={!fileAvailable}
                        tooltip="Download transcription as a midi file"
                    >
                        <div className={cx(util.flex_row, util.centered)}>
                            <i className="material-icons left">file_download</i>
                            <span>Download</span>
                        </div>
                    </Button>
                </div> 
                <MidiPlayer 
                src={props.midiFileURL || ""} 
                soundFont=""
                visualizer="#visualizer"
                ref={playerRef}
                className={util.full_width}
                />
            </div>

            <MidiVisualizer 
              src={props.midiFileURL || ""} 
              id="visualizer" 
              type="piano-roll"  
              ref={visualizerRef}
            />
        </div>
    );
}