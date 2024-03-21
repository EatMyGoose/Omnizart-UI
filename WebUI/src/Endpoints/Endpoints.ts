import { TTranscriptionMode } from '../types';

export namespace Endpoints
{
    export function PostJob(mode: TTranscriptionMode): string
    {
        const baseURL = new URL("http://localhost:8000/music/transcribe-cancellable");
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

    export function CancelJob(jobId: number): string
    {
        return `http://localhost:8000/music/terminate/${jobId}`;
    }

    export function ListJobs(): string
    {
        return `http://localhost:8000/music/status/all`;
    }
}

