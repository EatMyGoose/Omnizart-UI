import React from "react"

import { Checkbox } from "../Components/Checkbox";
import { JobHistoryPanel } from "../Components/JobStatusPanel"
import { IJobStatus, IsJobReady } from "../types"
import { cx } from "../util"
import util from "../util.module.css"
import { Collapsible } from "../Components/Collapsible";
import { Spinner } from "../Components/Spinner";

namespace JobFilters
{
    function OnlyReadyResults(jobs: IJobStatus[]) : IJobStatus[]
    {
        return jobs.filter(j => IsJobReady(j.status));
    }

    function ByFilename(jobs: IJobStatus[], substring: string) : IJobStatus[]
    {
        const substringLowercase = substring.toLowerCase();
        return jobs.filter(j => j.filename.toLowerCase().includes(substringLowercase));
    }

    export function FilterJobs(
        jobs: IJobStatus[], 
        filenameSeachQuery: string,
        readyResultsOnly: boolean) : IJobStatus[]
    {
        const filteredByFilename = (
            filenameSeachQuery.length > 0? 
            ByFilename(jobs, filenameSeachQuery) :
            jobs
        );

        const filteredByReadyStatus = (
            readyResultsOnly?
            OnlyReadyResults(filteredByFilename) :
            filteredByFilename
        );

        return filteredByReadyStatus;
    }
}

export interface ISidebar
{
    pollingJobHistory: boolean
    jobHistory: IJobStatus[]
    className?: string | undefined
}

export function Sidebar(props: ISidebar)
{
    const [readyJobsOnly, setReadyJobsOnly] = React.useState<boolean>(false);
    const [filenameFilter, setFilenameFilter] = React.useState<string>("");

    const filteredJobs = JobFilters.FilterJobs(
        props.jobHistory, 
        filenameFilter, 
        readyJobsOnly
    );

    return (
        <div 
            className={cx(util.full_width, util.overflow_y_scroll, "card-panel", props.className || "")}
        >
            <div className={cx(util.flex_row, util.space_between)}>
                <h6>Transcription History</h6>

                <Spinner
                    loading={props.pollingJobHistory}
                    sizeClass="small"
                    className={util.scale_75}
                />
            </div>
            <Collapsible
                summary={(<><i className="material-icons">settings</i>Settings</>)}
                initiallyCollapsed={true}
            >
                <div>
                    <div className="input-field">
                        <input  
                            placeholder="Filter by filename" 
                            id="filenameFilter" 
                            type="text" 
                            className="validate"
                            value={filenameFilter}
                            onChange={(e) => setFilenameFilter(e.target.value)}
                        />
                        <label htmlFor="filenameFilter" className="active">Filename Filter</label>
                    </div>
                    <Checkbox
                        checked={readyJobsOnly}
                        onClick={setReadyJobsOnly}
                        label="Finished Jobs Only"
                    />
                </div>
            </Collapsible>

            {
                filteredJobs.map(
                    (job, idx) => {
                        return (
                            <ul className="collection" key={idx}>
                                <JobHistoryPanel
                                    id={job.id}
                                    filename={job.filename}
                                    status={job.status}
                                />
                            </ul>
                        );
                    }
                )
            }
        </div>
    )
}