import React from 'react'
import './App.css'
import { useObjectURL } from './useObjectURL';
import util from "./util.module.css"
import { TTranscriptionMode } from './types';
import { useTranscriptionJob } from './Hooks/useTranscriptionJob';
import { AppBody } from './AppBody/AppBody';
import { Sidebar } from './Sidebar/Sidebar';
import { cx } from './util';
import { useJobHistory } from './Hooks/useJobHistoryList';


function App() {
  const [transcriptionMode, setTranscriptionMode] = React.useState<TTranscriptionMode>("music");
  const [file, setFile] = React.useState<File | null>(null);
  const [autoTranscribe, setAutoTranscribe] = React.useState<boolean>(false);

  const transcriptionJob = useTranscriptionJob();
  
  const midiFileURL = useObjectURL(transcriptionJob.data, transcriptionJob.ready);

  const [activePlayer, setActivePlayer] = React.useState<string | undefined>(undefined);

  const jobHistory = useJobHistory();

  return (
    <>
      <nav className='app-row'>
        <div className="nav-wrapper">
          <div className='container'>
            <span className="brand-logo">Omnizart Web UI</span>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li><a href="#">Rats</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className='row app-row-fill'>
        <Sidebar
          className={cx('col s2', util.full_height)}
          jobHistory={jobHistory}
        />
        <div className='col s10'>
          <AppBody
            autoTranscribe={autoTranscribe}
            setAutoTranscribe={setAutoTranscribe}
            file={file}
            setFile={setFile}
            transcriptionMode={transcriptionMode}
            setTranscriptionMode={setTranscriptionMode}
            transcriptionJob={transcriptionJob}
            activePlayer={activePlayer}
            setActivePlayer={setActivePlayer}
            midiFileURL={midiFileURL}
          />
        </div>
      </div>
    </>
  )
}

export default App
