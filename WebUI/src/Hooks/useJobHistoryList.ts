import { useQuery } from "@tanstack/react-query";
import { IJobStatus } from "../types";
import { Endpoints } from "../Endpoints/Endpoints";


export function useJobHistory() : IJobStatus[]
{
    const jobHistoryQuery = useQuery({
        queryKey: ["transcription-job-history"],
        queryFn: async () => {
            const response = await fetch(
                Endpoints.ListJobs()
            );

            return (await response.json()) as IJobStatus[];
        },
        staleTime: 5000
    });

    return jobHistoryQuery.data || [];
}