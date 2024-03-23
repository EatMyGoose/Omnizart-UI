import { cx } from "../util";

export interface ISidebarFAB
{
    sidebarOpen: boolean
    setSidebarOpen: (val: boolean) => void

    className?: string
}

export function SidebarFAB(props: ISidebarFAB)
{
    const iconName: string = props.sidebarOpen? 
        "keyboard_arrow_left": //shrink 
        "keyboard_arrow_right"; //Expand

    return (
        <a 
            className={cx("btn-floating btn-small waves-effect waves-light grey", props.className || "")}
            onClick={() => props.setSidebarOpen(!props.sidebarOpen)}
        >
            <i className="material-icons">{iconName}</i>
        </a>
    );
}