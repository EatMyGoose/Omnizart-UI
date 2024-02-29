import React from "react"
import { Button } from "../Components/Button";
import util from "../util.module.css"
import { MidiPlayer } from "../MidiPlayer";
import { MidiVisualizer } from "../MidiVisualizer";
import { PlayerElement, VisualizerElement } from "html-midi-player";
import 'material-icons/iconfont/material-icons.css';

interface ITranscriptionResult
{
    midiFileURL?: string,
    midiFilename?: string
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

    const downloadLink = (props.midiFileURL === undefined? 
        undefined:
        (
            <Button
                onClick={() => midiDownloadRef.current?.click()}
            >
                <i className="material-icons left">file_download</i>
                Download
            </Button>
        )
    );
    return (
        <div>
            <a  
                className={util.hidden} 
                download={props.midiFilename || "transcribed"}
                href={props.midiFileURL}
                ref={midiDownloadRef}
            />
            <h6>Transcription Result</h6>
            {downloadLink}

            <MidiPlayer 
              src={props.midiFileURL || ""} 
              soundFont=""
              visualizer="#visualizer"
              ref={playerRef}
              className={util.full_width}
            />

            <MidiVisualizer 
              src={props.midiFileURL || ""} 
              id="visualizer" 
              type="piano-roll"  
              ref={visualizerRef}
            />
        </div>
    );
}