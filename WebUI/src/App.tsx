import React, { ChangeEvent } from 'react'
import './App.css'
import {useQuery } from '@tanstack/react-query';
import { useObjectURL } from './useObjectURL';
import { MidiPlayer } from './MidiPlayer';
import { MidiVisualizer } from './MidiVisualizer';
import { PlayerElement, VisualizerElement } from 'html-midi-player';
import { TranscriptionControls } from './TranscriptionControls/TranscriptionControls';

export const TTranscriptionModeValues = ["music", "drum", "chord", "vocal", "vocal-contour"] as const;
export type TTranscriptionMode = typeof TTranscriptionModeValues[number];

export const modeNameMap = new Map<TTranscriptionMode, string>([
  ["music", "Music"],
  ["drum", "Drum"],
  ["chord", "Chords"],
  ["vocal", "Vocal"],
  ["vocal-contour", "Vocal Contour"]
]);

function GetRequestURL(mode: TTranscriptionMode): string
{
  const baseURL = new URL("http://localhost:8000/music/transcribe");
  baseURL.searchParams.set("mode", mode);
  return baseURL.toString();
}

function App() {
  const [transcriptionMode, setTranscriptionMode] = React.useState<TTranscriptionMode>("music");
  const [file, setFile] = React.useState<File | null>(null);

  const transcriptionResult = useQuery({
    queryKey: ["transcription"],
    queryFn: async (_) => {
      if(file === null) throw new Error("No file selected");

      const payload = new FormData();
      payload.append("music-file", file);
      const response = await fetch(
        GetRequestURL(transcriptionMode),
        {
          method: "POST",
          body: payload
        }
      );

      return await response.blob();
    },
    enabled: false,
    retry: false,
  })

  const midiFileURL = useObjectURL(transcriptionResult.data, transcriptionResult.isSuccess);

  const playerRef = React.useRef<PlayerElement>(null);
  const visualizerRef = React.useRef<VisualizerElement>(null);

  React.useEffect(() => {
    if(playerRef.current && visualizerRef.current)
    {
      console.log("attaching");
      playerRef.current.addVisualizer(visualizerRef.current);
      return () => playerRef.current!.removeVisualizer(visualizerRef.current!);
    }

    return () => {};
  }, [playerRef.current, visualizerRef.current])
  

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
            <span className="card-title"><h5>Transcription Controls</h5></span>
              <div className="section">
                <TranscriptionControls
                  currentFile={file}
                  onFileChanged={setFile}
                  transcriptionMode={transcriptionMode}
                  setTranscriptionMode={setTranscriptionMode}
                  disabled={transcriptionResult.isFetching}
                  sendTranscriptionRequest={() => transcriptionResult.refetch()}
                />
                </div>
                {
                  (
                    (transcriptionResult.isFetching)?  
                      (<div className="progress">
                        <div className="indeterminate"></div>
                      </div>):
                      undefined
                  )
                }
              <div className="divider"/>
              <div className='section'>
                <h6>Transcription Result</h6>
                {
                  (!transcriptionResult.isFetching && midiFileURL !== undefined)?
                      (
                        <div>
                          <a href={midiFileURL} download="transcribed">Download file</a>
                        </div>
                      )
                      : undefined
                }
              </div>
              <MidiPlayer 
                src={midiFileURL || ""} 
                soundFont=""
                visualizer="#visualizer"
                ref={playerRef}
              />

              <MidiVisualizer 
                src={midiFileURL || ""} 
                id="visualizer" 
                type="piano-roll"  
                style={{height:"30vh"}}
                ref={visualizerRef}
              />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
