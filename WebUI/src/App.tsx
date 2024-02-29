import React from 'react'
import './App.css'
import {useQuery } from '@tanstack/react-query';
import { useObjectURL } from './useObjectURL';
import { MidiPlayer } from './MidiPlayer';
import { MidiVisualizer } from './MidiVisualizer';
import { PlayerElement, VisualizerElement } from 'html-midi-player';
import { TranscriptionControls } from './TranscriptionControls/TranscriptionControls';
import { ProgressInfo } from './ProgressInfo/ProgressInfo';
import { TranscriptionResult } from './TranscriptionResult/TranscriptResult';

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

function GetFilenameWithouExtension(filename:string)
{
  return filename.split(".")[0];
}

function App() {
  const [transcriptionMode, setTranscriptionMode] = React.useState<TTranscriptionMode>("music");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = React.useState<string|undefined>(undefined);
  const [midiFilename, setMidiFilename] = React.useState<string|undefined>(undefined);

  const transcriptionResult = useQuery({
    queryKey: ["transcription"],
    queryFn: async () => {
      if(file === null) throw new Error("No file selected");

      setUploadedFilename(file.name);

      const payload = new FormData();
      payload.append("music-file", file);
      const response = await fetch(
        GetRequestURL(transcriptionMode),
        {
          method: "POST",
          body: payload
        }
      );

      setMidiFilename(GetFilenameWithouExtension(file.name));
      return await response.blob();
    },
    enabled: false,
    retry: false,
  })

  const midiFileURL = useObjectURL(transcriptionResult.data, transcriptionResult.isSuccess);

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
                  currentFile={file}
                  onFileChanged={setFile}
                  transcriptionMode={transcriptionMode}
                  setTranscriptionMode={setTranscriptionMode}
                  disabled={transcriptionResult.isFetching}
                  sendTranscriptionRequest={() => transcriptionResult.refetch()}
                />
              </div>
              <div>
                <ProgressInfo
                  isLoading={transcriptionResult.isFetching}
                  filename={uploadedFilename}
                />
              </div>
            </div>
            <div className="divider"/>

            <TranscriptionResult
              midiFileURL={midiFileURL}
              midiFilename={midiFilename}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
