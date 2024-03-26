import { ITranscriptionJobStatus } from "../Hooks/useTranscriptionJob";
import { ProgressInfo } from "../ProgressInfo/ProgressInfo";
import { TranscriptionControls } from "../TranscriptionControls/TranscriptionControls";
import { TranscriptionResult } from "../TranscriptionResult/TranscriptResult";
import { TTranscriptionMode } from "../types";
import { cx } from "../util";
import util from "../util.module.css"

export interface IAppBody
{
    autoTranscribe: boolean
    setAutoTranscribe: (newValue: boolean) => void

    file: File | null
    setFile: (newFile: File | null) => void

    transcriptionMode: TTranscriptionMode
    setTranscriptionMode: (newMode: TTranscriptionMode) => void

    transcriptionJob: ITranscriptionJobStatus

    activePlayer: string | undefined
    setActivePlayer: (newPlayer: string | undefined) => void

    midiFileURL: string | undefined

    className?: string | undefined
}

export function AppBody(props: IAppBody)
{
    return (
        <div className={cx(props.className || "")}>
            <div className="card">
                <div className="card-content">
                    <div className="section">
                        <div>
                            <TranscriptionControls
                            autoTranscribe={props.autoTranscribe}
                            setAutoTranscribe={props.setAutoTranscribe}
                            currentFile={props.file}
                            onFileChanged={props.setFile}
                            transcriptionMode={props.transcriptionMode}
                            setTranscriptionMode={props.setTranscriptionMode}
                            disabled={props.transcriptionJob.isFetching}
                            sendTranscriptionRequest={(file) => props.transcriptionJob.postJob(file, props.transcriptionMode)}
                            cancelling={props.transcriptionJob.cancelling}
                            cancellable={props.transcriptionJob.cancellable}

                            transcriptionInProgress={props.transcriptionJob.isFetching}
                            sendCancelRequest={props.transcriptionJob.cancelJob}

                            activePlayer={props.activePlayer}
                            setActivePlayer={props.setActivePlayer}
                            />
                        </div>
                    </div>
                    <div className="divider"/>
                    <div className="section">
                        <form>
                            <h6 className={cx(util.my_1, util.my_b_2)}>Transcription Result</h6>
                            <ProgressInfo
                            isLoading={props.transcriptionJob.isFetching}
                            filename={props.transcriptionJob.filename}
                            />
                            <TranscriptionResult
                            midiFileURL={props.midiFileURL}
                            midiFilename={props.transcriptionJob.filename}
                            
                            activePlayer={props.activePlayer}
                            setActivePlayer={props.setActivePlayer}

                            className={util.my_1}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}