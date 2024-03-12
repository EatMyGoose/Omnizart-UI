import React from 'react'
import './App.css'
import { useObjectURL } from './useObjectURL';
import { TranscriptionControls } from './TranscriptionControls/TranscriptionControls';
import { ProgressInfo } from './ProgressInfo/ProgressInfo';
import { TranscriptionResult } from './TranscriptionResult/TranscriptResult';
import util from "./util.module.css"
import { TTranscriptionMode } from './types';
import { useTranscriptionJob } from './Hooks/useTranscriptionJob';


function App() {
  const [transcriptionMode, setTranscriptionMode] = React.useState<TTranscriptionMode>("music");
  const [file, setFile] = React.useState<File | null>(null);
  const [autoTranscribe, setAutoTranscribe] = React.useState<boolean>(false);

  const transcriptionJob = useTranscriptionJob();
  
  const midiFileURL = useObjectURL(transcriptionJob.data, transcriptionJob.ready);

  return (
    <>
      <nav>
        <div className="nav-wrapper">
          <div className='container'>
            <span className="brand-logo">Omnizart Web UI</span>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li><a href="#">Rats</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className='container'>
        <div className="card">
          <div className="card-content">
            <span className="card-title">
              <h5>Transcription Controls</h5>
            </span>

            <div className="section">
              <div>
                <TranscriptionControls
                  autoTranscribe={autoTranscribe}
                  setAutoTranscribe={setAutoTranscribe}
                  currentFile={file}
                  onFileChanged={setFile}
                  transcriptionMode={transcriptionMode}
                  setTranscriptionMode={setTranscriptionMode}
                  disabled={transcriptionJob.isFetching}
                  sendTranscriptionRequest={(file) => transcriptionJob.postJob(file, transcriptionMode)}
                  cancelling={transcriptionJob.cancelling}
                  cancellable={transcriptionJob.cancellable}

                  transcriptionInProgress={transcriptionJob.isFetching}
                  sendCancelRequest={transcriptionJob.cancelJob}
                />
              </div>
            </div>
            <div className="divider"/>
            <form>
              <h6 className={util.my_1}>Transcription Result</h6>
              <ProgressInfo
                className={util.my_1}
                isLoading={transcriptionJob.isFetching}
                filename={transcriptionJob.filename}
              />
              <TranscriptionResult
                midiFileURL={midiFileURL}
                midiFilename={transcriptionJob.filename}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
