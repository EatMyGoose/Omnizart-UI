import React from "react"

export interface IButton
{
    children: React.ReactNode
    buttonSize?: "btn" | "btn-large" | "btn-small"
    onClick: () => void
    disabled?: boolean
    className?: string
}

export function Button(props: IButton)
{
    const sizeClass: string = props.buttonSize || "btn";
    const disabledClass: string = props.disabled? "disabled" : "";

    return (
        <a 
            className={`waves-effect waves-light ${sizeClass} ${disabledClass} ${props.className || ""}`}
            onClick={props.onClick}
        >
            {props.children}
        </a>
    )       
}