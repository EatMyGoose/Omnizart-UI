import React from "react"
import { useObjectURL } from "../useObjectURL";
import { FileInput } from "../Components/FileInput";
import { Button } from "../Components/Button";
import util from "../util.module.css"
import { cx } from "../util";
import { ToggleButton } from "../Components/ToggleButton";
import { TTranscriptionMode, TTranscriptionModeValues, modeNameMap, supportedModes } from "../types";
import { Spinner } from "../Components/Spinner";
import { useSingleMusicPlayer } from "../Hooks/useSingleMusicPlayer";

interface ITranscriptionControls
{
    autoTranscribe: boolean
    setAutoTranscribe: (val: boolean) => void

    currentFile: File | null
    onFileChanged: (newFile: File) => void

    transcriptionMode: TTranscriptionMode
    setTranscriptionMode: (newMode: TTranscriptionMode) => void

    disabled: boolean

    sendTranscriptionRequest: (file :File) => void
    transcriptionInProgress: boolean,

    sendCancelRequest: () => void,
    cancellable: boolean,
    cancelling: boolean,

    activePlayer?: string
    setActivePlayer: (string: string | undefined) => void

    className?: string
}

export function TranscriptionControls(props: ITranscriptionControls)
{
    function onFileSelected(e: React.ChangeEvent<HTMLInputElement>)
    {
        if(e.target.files && e.target.files.length >= 1)
        {
            const file: File = e.target.files[0];
            props.onFileChanged(file);

            if(props.autoTranscribe)
            {
                props.sendTranscriptionRequest(file)
            }
        }
    }

    const playerRef = React.useRef<HTMLAudioElement>(null);

    const fileSelected: boolean = props.currentFile !== null;
    const originalFileURL = useObjectURL(
        props.currentFile || undefined, 
        fileSelected
    );

    const player = useSingleMusicPlayer(
        "original",
        props.setActivePlayer,
        props.activePlayer,
        () => playerRef.current?.pause()
    );

    const canSendTranscriptionRequest: boolean = fileSelected && !props.disabled;

    const cancellingElem = (
        <div className={cx(util.flex_row, util.centered, util.full_width)}>
            <Spinner
                loading={true}
                sizeClass="small"
                colorClass="spinner-yellow-only"
                className={util.scale_75}
            />
            <div>
                Cancelling
            </div>
        </div>
    );

    return (
        <form 
            className={props.className}
            action="#"
            onSubmit={(e) => {e.preventDefault()}}
        >
            <div className={cx(util.flex_row, util.space_between)}>
                <h6>Select Input File</h6>
                
                <ToggleButton
                    className={util.float_right}
                    value={props.autoTranscribe}
                    onChange={props.setAutoTranscribe}
                    onText={"Auto-Transcribe (On)"}
                    offText={"Auto-Transcribe (Off)"}
                    tooltip="If on, starts transcribing immediately after uploading a file"
                />
            </div>
            <div className={util.my_1}>
                <label>Upload music file</label>
                <FileInput
                    accept="audio/*" 
                    onChange={onFileSelected}
                    disabled={props.disabled}
                    className={util.my_0}
                    tooltip="Select an audio file to transcribe"
                />
            </div>
            <div className={util.my_1}>
                <label>Original File:</label>
                <br/>
                <audio 
                    controls 
                    src={originalFileURL}
                    className={cx(util.full_width)}
                    onPlay={player.start}
                    onPause={player.stop}
                    ref={playerRef}
                />
            </div>
            <div className={util.my_1}>                  
                <label>Transcription Mode</label>
                <select 
                    value={props.transcriptionMode}
                    onChange={(e) => {props.setTranscriptionMode(e.target.value as TTranscriptionMode)}}
                    className="browser-default"
                    disabled={props.disabled}
                >
                    {
                        TTranscriptionModeValues.map(mode => {
                            return (
                            <option
                                key={mode}
                                value={mode}
                                disabled={!supportedModes.has(mode)}
                            >
                                {modeNameMap.get(mode)} 
                            </option>
                            )
                        })
                    }
                </select>   
            </div>
            <div className="row">
                <div className={cx("col s8", util.px_1)}>
                    <Button 
                        disabled={!canSendTranscriptionRequest}
                        onClick={() => props.sendTranscriptionRequest(props.currentFile!)}
                        className={cx(util.full_width, util.my_1, util.px_0)}
                    >
                        Transcribe
                    </Button>
                </div>
                <div className={cx("col s4", util.px_1)}>
                    <Button
                        disabled={!props.cancellable}
                        onClick={props.sendCancelRequest}
                        className={cx(util.full_width, util.my_1, util.px_0, props.cancelling? "orange" : "")}
                    >
                        {props.cancelling? 
                            cancellingElem : 
                            "Cancel"
                        }
                    </Button>
                </div>
            </div>
        </form>
    )
}   