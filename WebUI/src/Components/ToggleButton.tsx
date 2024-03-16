import React from "react"
import { cx } from "../util"
import util from "../util.module.css"
import { useToolTip } from "../Hooks/useToolTip"

export interface IToggleButton
{
    value: boolean,
    onChange: (newValue: boolean) => void
    disabled?: boolean
    className?: string
    offText: React.ReactNode
    onText: React.ReactNode
    tooltip?: string
}

export function ToggleButton(props: IToggleButton)
{
    const refCallback = useToolTip(props.tooltip !== undefined);

    return (
        <div 
          className={cx("switch tooltipped", util.float_right)} 
          ref={refCallback}
          data-tooltip={props.tooltip}
        >
            <label>
              {props.value? props.onText: props.offText}
              <input 
                type="checkbox"
                checked={props.value}
                onChange={(e) => props.onChange(e.target.checked)}
                disabled={props.disabled}
                />
              <span className="lever"></span>
            </label>
        </div>
    )
}