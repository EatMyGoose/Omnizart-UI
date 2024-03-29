import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IJobStatus } from "../types";
import { Endpoints } from "../Endpoints/Endpoints";
import { useCallback } from "react";

const jobHistoryKey = "transcription-job-history" as const;

export interface IJobHistory
{
    jobHistories: IJobStatus[],
    polling: boolean
}

export function useJobHistory() : IJobHistory
{
    const jobHistoryQuery = useQuery({
        queryKey: [jobHistoryKey],
        queryFn: async () => {
            const response = await fetch(
                Endpoints.ListJobs()
            );

            return (await response.json()) as IJobStatus[];
        },
        refetchInterval: 60000
    });

    return {
        jobHistories: jobHistoryQuery.data || [],
        polling: jobHistoryQuery.isFetching
    }
}

export function useInvalidateJobHistory() : () => Promise<void>
{
    const client = useQueryClient();

    return useCallback(
        () => client.invalidateQueries({ queryKey: [jobHistoryKey] }),
        [client]
    );
}
