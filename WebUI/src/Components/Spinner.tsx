export interface ISpinner
{
    loading: boolean
    className?: string
    colorClass? : "" | "spinner-red-only" | "spinner-yellow-only" | "spinner-blue-only"
    sizeClass? : "" | "big" | "small"
}

export function Spinner(props: ISpinner)
{
    if(!props.loading) return <></>;

    const colorClass = props.colorClass || "";
    const sizeClass = props.sizeClass || "";

    return (
        <div className={`preloader-wrapper active ${sizeClass} ${props.className || ""}`}>
            <div className={`spinner-layer ${colorClass}`}>
                <div className="circle-clipper left">
                    <div className="circle"></div>
                </div><div className="gap-patch">
                    <div className="circle"></div>
                </div><div className="circle-clipper right">
                    <div className="circle"></div>
                </div>
            </div>
        </div>
    );
}