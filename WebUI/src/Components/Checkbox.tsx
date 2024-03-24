import React from "react"

export interface ICheckbox
{
    checked: boolean
    onClick: (newValue: boolean) => void

    label: React.ReactNode

    className?: string
}

export function Checkbox(props: ICheckbox)
{
    return (
        <label className={props.className || ""}>
            <input 
                type="checkbox" 
                className="filled-in" 
                checked={props.checked} 
                onChange={(e) => props.onClick((e.target as HTMLInputElement).checked)}
            />
            <span>{props.label}</span>
        </label>
    );
}