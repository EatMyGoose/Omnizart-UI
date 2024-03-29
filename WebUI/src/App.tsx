import React from 'react'
import styles from './App.module.css'
import { useObjectURL } from './useObjectURL';
import util from "./util.module.css"
import { TTranscriptionMode } from './types';
import { useTranscriptionJob } from './Hooks/useTranscriptionJob';
import { AppBody } from './AppBody/AppBody';
import { Sidebar } from './Sidebar/Sidebar';
import { cx } from './util';
import { useJobHistory } from './Hooks/useJobHistoryList';
import { SidebarFAB } from './SidebarFAB/SIdebarFAB';
import { Navbar } from './Navbar/Navbar';


function App() {
  const [transcriptionMode, setTranscriptionMode] = React.useState<TTranscriptionMode>("music");
  const [file, setFile] = React.useState<File | null>(null);
  const [autoTranscribe, setAutoTranscribe] = React.useState<boolean>(false);

  const transcriptionJob = useTranscriptionJob();
  
  const midiFileURL = useObjectURL(transcriptionJob.data, transcriptionJob.ready);

  const [activePlayer, setActivePlayer] = React.useState<string | undefined>(undefined);

  const {jobHistories, polling} = useJobHistory();

  const [showSidebar, setShowSidebar] = React.useState<boolean>(true);

  return (
    <>
      <Navbar/>
      
      <div className={cx('app-row-fill', util.my_0, util.my_0, util.flex_row, styles.body_container)}>
        <div className={cx(styles.sidebar,showSidebar? "" : styles.hide)}>
          <Sidebar
            pollingJobHistory={polling} 
            className={cx(util.full_height, util.my_0, util.my_0)}
            jobHistory={jobHistories}
          />
        </div>
        <div className={cx(styles.body_container, util.relative, util.full_height, util.overflow_y_scroll, showSidebar? "s10" : "s12")}>
          <SidebarFAB
            sidebarOpen={showSidebar}
            setSidebarOpen={setShowSidebar}
            className={cx(util.m_1, util.fixed)} 
          />
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
            className={styles.app_body}
          />
        </div>
      </div>
    </>
  )
}

export default App
