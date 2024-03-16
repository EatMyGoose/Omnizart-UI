import React from "react"
import { useToolTip } from "../Hooks/useToolTip"

export interface IButton
{
    children: React.ReactNode
    buttonSize?: "btn" | "btn-large" | "btn-small"
    onClick: () => void
    disabled?: boolean
    className?: string
    tooltip?: string
}

export function Button(props: IButton)
{
    const sizeClass: string = props.buttonSize || "btn";
    const disabledClass: string = props.disabled? "disabled" : "";

    const callbackRef = useToolTip(props.tooltip !== undefined);

    return (
        <a 
            className={`waves-effect waves-light tooltipped ${sizeClass} ${disabledClass} ${props.className || ""}`}
            onClick={props.onClick}
            ref={callbackRef}
            data-tooltip={props.tooltip}
        >
            {props.children}
        </a>
    )       
}