import { JobHistoryPanel } from "../Components/JobStatusPanel"
import { IJobStatus } from "../types"
import { cx } from "../util"
import util from "../util.module.css"

export interface ISidebar
{
    jobHistory: IJobStatus[],
    className?: string | undefined
}

export function Sidebar(props: ISidebar)
{
    return (
        <div 
            className={cx(util.full_width, util.overflow_y_scroll, "card-panel", props.className || "")}
        >
            <h6>Transcription History</h6>
            {
                props.jobHistory.map(
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