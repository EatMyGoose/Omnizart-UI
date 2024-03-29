export const TTranscriptionModeValues = ["music", "drum", "chord", "vocal", "vocal-contour"] as const;
export type TTranscriptionMode = typeof TTranscriptionModeValues[number];

export const modeNameMap = new Map<TTranscriptionMode, string>([
  ["music", "Music"],
  ["drum", "Drum"],
  ["chord", "Chords"],
  ["vocal", "Vocal"],
  ["vocal-contour", "Vocal Contour"]
]);

export const supportedModes = new Set<TTranscriptionMode>([
  "music",
  "vocal"
])

export const StatusCodeList = ["NONE" , "RUNNING" , "DONE" , "STOPPING" , "TERMINATED" , "ERROR"] as const;
//type TStatusCode = typeof StatusCodeList[number];

export function IsJobReady(status: string) : boolean 
{
    return status === "DONE";
}

export interface IJobStatus
{
    id:number,
    filename: string,
    mode: string,
    start_time: string,
    end_time?: string,
    request_terminate: boolean,
    status: string,
    done: boolean
}