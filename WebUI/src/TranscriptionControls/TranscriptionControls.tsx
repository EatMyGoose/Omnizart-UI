import React from "react"
import { useObjectURL } from "../useObjectURL";
import { TTranscriptionMode, TTranscriptionModeValues, modeNameMap } from "../App";
import { FileInput } from "../Components/FileInput";
import { Button } from "../Components/Button";
import util from "../util.module.css"
import { cx } from "../util";

interface ITranscriptionControls
{
    currentFile: File | null
    onFileChanged: (newFile: File) => void

    transcriptionMode: TTranscriptionMode
    setTranscriptionMode: (newMode: TTranscriptionMode) => void

    disabled: boolean

    sendTranscriptionRequest: () => void

    className?: string
}

export function TranscriptionControls(props: ITranscriptionControls)
{
    function onFileSelected(e: React.ChangeEvent<HTMLInputElement>)
    {
        if(e.target.files && e.target.files.length >= 1)
        {
            props.onFileChanged(e.target.files[0]);
        }
    }

    const fileSelected: boolean = props.currentFile !== null;
    const originalFileURL = useObjectURL(
        props.currentFile || undefined, 
        fileSelected
    );

    const canSendTranscriptionRequest: boolean = fileSelected && !props.disabled;

    return (
        <form 
            className={props.className}
            action="#"
            onSubmit={(e) => {e.preventDefault()}}
        >
            <h6>Select Input File</h6>
            <div className={util.my_1}>
                <label>Upload .wav file</label>
                <FileInput
                    accept="audio/*" 
                    onChange={onFileSelected}
                    disabled={props.disabled}
                    className={util.my_0}
                />
            </div>
            <div className={util.my_1}>
                <label>Original File:</label>
                <br/>
                <audio 
                    controls 
                    src={originalFileURL}
                    className={cx(util.full_width)}
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
                            >
                                {modeNameMap.get(mode)}
                            </option>
                            )
                        })
                    }
                </select>   
            </div>
            <Button 
                disabled={!canSendTranscriptionRequest}
                onClick={props.sendTranscriptionRequest}
                className={cx(util.full_width, util.my_1)}
            >
                Transcribe
            </Button>
        </form>
    )
}   