import React from "react"
import { useQuery } from '@tanstack/react-query';
import { IJobStatus, TTranscriptionMode } from '../types';
import { GetFilenameWithoutExtension, IsSuccessfulResponse } from "../util";
import { useToast } from "./useToast";
import { Endpoints } from "../Endpoints/Endpoints";
import { useInvalidateJobHistory } from "./useJobHistoryList";

export interface ITranscriptionJobStatus
{
    data: Blob | undefined
    filename: string | undefined,

    isFetching: boolean,
    ready: boolean,
    cancelling: boolean,
    cancellable: boolean,
    status: string,

    jobId: number | undefined,

    postJob: (payload: File, mode: TTranscriptionMode) => void;

    cancelJob: () => void;
}

interface IPostJobParams
{
    fileToSend: File | undefined,
    mode: TTranscriptionMode,
    
    //ReactQuery doesn't seem to detect changes in Files used in the query key
    //Generate a unique ID for each file instead to retrigger each change
    _fileNo: number;
}

export function useTranscriptionJob() : ITranscriptionJobStatus
{
    const [postJobParams, setPostJobParams] = React.useState<IPostJobParams>({
        fileToSend: undefined,
        mode: "music",
        _fileNo: 0
    });

    const [filename, setFilename] = React.useState<string| undefined>(undefined);
    const [isFetching, setIsFetching] = React.useState<boolean>(false);
    const [ready, setIsReady] = React.useState<boolean>(false);
    const [status, setStatus] = React.useState<string>("");
    const [jobId, setJobId] = React.useState<number | undefined>(undefined);


    const [_cancelling, _setCancelling] = React.useState<boolean>(false);

    const _refreshJobHistoryAsync = useInvalidateJobHistory();

    const _toast = useToast();

    const postJobQuery = useQuery({
        queryKey: ["transcription-post-job", postJobParams],
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
                    _refreshJobHistoryAsync();
                    return jobId;
                });
        },
        enabled: postJobParams.fileToSend !== undefined,
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

            return await response.json().then(
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
            else return 3000;
        },
        retry: false,
        enabled: (jobId !== undefined),
        refetchOnWindowFocus: false
    });

    React.useEffect(() => {
        if(pollJobQuery.isError) 
        {
            _toast.error(`Failed to process job ID<${jobId}>`);
            setIsFetching(false); 
            _refreshJobHistoryAsync();
        }
    }
    , [pollJobQuery.isError, jobId])
    
    const jobComplete: boolean = pollJobQuery.data?.done || false;

    const downloadDataQuery = useQuery({
        queryKey: ["transcription-download", jobId],
        queryFn: async ({queryKey}) => {
            try
            {
                const [_, jobId] =  queryKey as [string, number];
                if(pollJobQuery.data?.request_terminate === true)
                {
                    _toast.info(`Job ${jobId} cancelled successfully`);
                    return;
                }

                const response = await fetch(
                    Endpoints.DownloadResult(jobId)
                );
                
                const success = IsSuccessfulResponse(response.status);
                if(!success)
                {
                    const errMsg = await response.text();
                    _toast.error(errMsg);
                    throw new Error(errMsg);
                }

                return await response.blob().then((blob) => {
                    setIsReady(true);
                    return blob;
                });
            }
            finally
            {
                setIsFetching(false);
                _refreshJobHistoryAsync();
            }
        },
        enabled: jobComplete,
        retry:false,
        refetchOnWindowFocus: false
    });

    const cancelJobQuery = useQuery({
        queryKey: ["transcription-cancel", jobId],

        queryFn: async({queryKey}) => {
            const [_, jobId] =  queryKey as [string, number];
            if(jobId === undefined)
            {
                _toast.warning(`Error, no job ID available`);
                console.error(`[transcription-cancel] Error - no jobId specified`);
                return false;
            }

            const response = await fetch(
                Endpoints.CancelJob(jobId)
            );
        
            const success = IsSuccessfulResponse(response.status);
            
            if(success)
            {
                _toast.info(`Cancelling transcription job ${jobId}`);
                _setCancelling(true);
            }
            else
            {
                _toast.error(`Failed to cancel transcription job ${jobId}`);
            }

            return success;
        },
        enabled: false,
        retry: false,
    });

    if(!isFetching && _cancelling)
    {
        _setCancelling(false);
    }

    return {
        data: downloadDataQuery.data,
        filename,
        isFetching,
        ready,
        status,
        jobId,
        cancellable: isFetching && jobId !== undefined,
        cancelling: _cancelling,
        postJob: (payload: File, mode: TTranscriptionMode) => {
            console.log(`clicked`);
            setJobId(undefined);
            setPostJobParams((prev) => {
                return {
                    fileToSend: payload,
                    mode: mode,
                    _fileNo: prev._fileNo + 1
                }
            });
            
            setIsFetching(true);
            setFilename(GetFilenameWithoutExtension(payload.name))
        },

        cancelJob: () => cancelJobQuery.refetch()
    }
}