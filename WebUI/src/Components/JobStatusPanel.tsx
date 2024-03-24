import { Endpoints } from "../Endpoints/Endpoints";
import { IsJobReady } from "../types"
import { cx } from "../util"
import util from "../util.module.css"
import styles from "./JobStatusPanel.module.css"

export interface IJobHistoryPanel
{
    id: number,
    filename: string,
    status: string,
}

export function JobHistoryPanel(props: IJobHistoryPanel)
{
    const readyForDownload = IsJobReady(props.status);
    const downloadURL = Endpoints.DownloadResult(props.id);
    return (
        <li className="collection-item">
            <div className={cx(styles.panel)}>
                <div className={cx(styles.info, util.truncate_content)}>
                    <p>ID: {props.id}</p>
                    <p>Filename: {props.filename}</p>
                    <p>Status: {props.status}</p>
                </div>
                <div className={cx("valign-wrapper", styles.download)}>
                    <a 
                        href={downloadURL}
                        download
                        className={cx("btn-flat", util.px_0, util.px0, readyForDownload? "" : "disabled")}
                    >
                        <i className="small material-icons">file_download</i>
                    </a>
                </div>
            </div>  
        </li>
    )
}