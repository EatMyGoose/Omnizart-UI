import React from "react";
import { cx } from "../util";
import M from "materialize-css"

export interface ICollapsible
{
    summary: React.ReactNode

    children: React.ReactNode

    initiallyCollapsed?: boolean

    className?: string
}

export function Collapsible(props: ICollapsible) 
{
    const [active, setActive] = React.useState<boolean>(
        props.initiallyCollapsed !== undefined?
            !props.initiallyCollapsed:
            true
    );

    function InitCollapsible(elem: HTMLUListElement | null)
    {
        if(elem === null) return;
        M.Collapsible.init(elem);
    }

    return (
        <ul 
            className={cx("collapsible", props.className || "")}
            onClick={() => setActive(a => !a)}
            ref={InitCollapsible}
        >
            <li className={active? "active" : ""}>
                <div className="collapsible-header">
                    {props.summary}
                </div>
                <div className="collapsible-body">
                    {props.children}
                </div>
            </li>
        </ul>
    );
}