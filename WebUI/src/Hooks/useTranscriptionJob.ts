import React from "react"
import { useQuery } from '@tanstack/react-query';
import { TTranscriptionMode } from '../types';
import { GetFilenameWithouExtension } from "../util";

namespace Endpoints
{
    export function PostJob(mode: TTranscriptionMode): string
    {
        const baseURL = new URL("http://localhost:8000/music/post-transcription-job");
        baseURL.searchParams.set("mode", mode);
        return baseURL.toString();
    }   

    export function PollJob(jobId: number) : string
    {
        return `http://localhost:8000/music/status/${jobId}`;
    }

    export function DownloadResult(jobId: number): string
    {
        return `http://localhost:8000/music/download-result/${jobId}`;
    }
}

interface ITranscriptionJobStatus
{
    data: Blob | undefined
    filename: string | undefined,

    isFetching: boolean,
    ready: boolean,
    status: string,

    jobId: number | undefined,

    postJob: (payload: File, mode: TTranscriptionMode) => void;
}

const StatusCodeList = ["NONE" , "RUNNING" , "DONE" , "STOPPING" , "TERMINATED" , "ERROR"] as const;
type TStatusCode = typeof StatusCodeList[number];

function JobStatusDone(status: TStatusCode) : boolean 
{
    return status === "DONE";
}

interface IJobStatus
{
    status: string,
    done: boolean
}

export function useTranscriptionJob() : ITranscriptionJobStatus
{
    const [filename, setFilename] = React.useState<string| undefined>(undefined);
    const [isFetching, setIsFetching] = React.useState<boolean>(false);
    const [ready, setIsReady] = React.useState<boolean>(false);
    const [status, setStatus] = React.useState<string>("");
    const [jobId, setJobId] = React.useState<number | undefined>(undefined);

    const [fileToSend, setFileToSend] = React.useState<File|undefined>(undefined);
    const [mode, setMode] = React.useState<TTranscriptionMode>("music");

    const postJobQuery = useQuery({
        queryKey: ["transcription-post-job", {fileToSend, mode}],
        queryFn: async ({queryKey}) => {
            const [_, settings] =  queryKey as [string, {fileToSend: File, mode: TTranscriptionMode}];
            
            if(settings.fileToSend === undefined) throw Error("File not found");

            const payload = new FormData();
            payload.append("music-file", settings.fileToSend);
            const response = await fetch(
                Endpoints.PostJob(settings.mode),
                {
                    method: "POST",
                    body: payload
                }
            );
            
            return await response
                .json()
                .then(json => {
                    const jobId: number = json.id;
                    if(typeof jobId !== "number") throw Error("Job ID not returned")

                    setJobId(jobId);
                    return jobId;
                });
        },
        enabled: fileToSend !== undefined,
        retry:false,
        refetchOnWindowFocus: false
    });

    React.useEffect(() => {
        if(postJobQuery.isError) setIsFetching(false); 
    }
    , [postJobQuery.isError])

    const pollJobQuery = useQuery({
        queryKey: ["transcription-poll-job", jobId],
        queryFn: async ({queryKey}) => {
            const [_, jobId] =  queryKey as [string, number];
            const response = await fetch(
                Endpoints.PollJob(jobId)
            );

            return response.json().then(
                json => {
                    const response = json as IJobStatus;
                    setStatus(response.status);
                    return response;
                }
            )
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            if(data !== undefined && data.done) return false;
            else return 1500;
        },
        retry: false,
        enabled: (jobId !== undefined),
        refetchOnWindowFocus: false
    });

    React.useEffect(() => {
        if(pollJobQuery.isError) setIsFetching(false); 
    }
    , [pollJobQuery.isError])

    const jobComplete: boolean = pollJobQuery.data?.done || false;

    const downloadDataQuery = useQuery({
        queryKey: ["transcription-download", jobId],
        queryFn: async ({queryKey}) => {
            const [_, jobId] =  queryKey as [string, number];
            const response = await fetch(
                Endpoints.DownloadResult(jobId)
            );

            return response.blob().finally(() => {
                setIsReady(true);
                setIsFetching(false);
            });
        },
        enabled: jobComplete,
        retry:false,
        refetchOnWindowFocus: false
    });

    return {
        data: downloadDataQuery.data,
        filename,
        isFetching,
        ready,
        status,
        jobId,
        postJob: (payload: File, mode: TTranscriptionMode) => {
            setFileToSend(payload);
            setMode(mode);
            if(payload === fileToSend) postJobQuery.refetch();
            
            setIsFetching(true);
            setFilename(GetFilenameWithouExtension(payload.name))
        }
    }
}