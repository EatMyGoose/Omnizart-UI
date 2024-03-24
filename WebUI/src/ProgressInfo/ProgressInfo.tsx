import React from "react"

interface IProgressInfo
{
    isLoading: boolean,
    filename?: string,

    errorMessage?: string
    className?: string
}

export function ProgressInfo(props: IProgressInfo)
{
    const prevLoadingState = React.useRef<boolean>(false);
    const timerRef = React.useRef<number|undefined>(undefined);

    const [startTime, setStartTime] = React.useState<Date>(new Date());
    const [endTime, setEndTime] = React.useState<Date | undefined>(undefined);
   
    React.useEffect(
        () => {
            const startTiming = props.isLoading && prevLoadingState.current === false;
            const endTiming = !props.isLoading && prevLoadingState.current === true;

            prevLoadingState.current = props.isLoading;

            if(startTiming)
            {
                setStartTime(new Date());
                timerRef.current = window.setInterval(() => setEndTime(new Date()), 100);
            }
            else if(endTiming)
            {
                setEndTime(new Date());

                window.clearInterval(timerRef.current);
                timerRef.current = undefined;
            }
        }
    , [props.isLoading]);

    const loader = (
        props.isLoading?
        (
            <div className="progress">
                <div className="indeterminate"></div>
            </div>
         
        ) :
        undefined
    );

    const elapsedSeconds: number = (endTime !== undefined)?
        (endTime.getTime() - startTime.getTime()) / 1000 :
        0;

    const elapsedTime = (
        <div className="input-field">
            <input 
                id="elapsedTime" 
                type="text" 
                className="validate"
                readOnly
                value={`${elapsedSeconds.toFixed(1)} s`}
            />
            <label htmlFor="elapsedTime" className="active">Elapsed Time</label>
        </div>
    )

    return (
        <div className={props.className || ""}>
            <div>
                <div className="input-field">
                    <input 
                        placeholder="No file selected" 
                        id="uploadedFilename" 
                        type="text" 
                        className="validate"
                        readOnly
                        value={props.filename || ""}
                    />
                    <label htmlFor="uploadedFilename" className="active">Filename</label>
                </div>
            </div>
            {elapsedTime}
            {loader}
        </div>
    )
}