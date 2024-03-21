import { Endpoints } from "../Endpoints/Endpoints";
import { IsJobReady } from "../types"
import { cx } from "../util"
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
                <div className={styles.info}>
                    <p>ID: {props.id}</p>
                    <p>Filename: {props.filename}</p>
                    <p>Status: {props.status}</p>
                </div>
                <div className="valign-wrapper">
                    <a 
                        href={downloadURL}
                        download
                        className={cx("btn-flat", readyForDownload? "" : "disabled")}
                    >
                        <i className="small material-icons">file_download</i>
                    </a>
                </div>
            </div>  
        </li>
    )
}