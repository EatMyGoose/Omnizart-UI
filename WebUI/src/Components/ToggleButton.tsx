import { cx } from "../util"
import util from "../util.module.css"

export interface IToggleButton
{
    value: boolean,
    onChange: (newValue: boolean) => void
    disabled?: boolean
    className?: string
}

export function ToggleButton(props: IToggleButton)
{
    return (
        <div className={cx("switch", util.float_right)}>
            <label>
              Off
              <input 
                type="checkbox"
                checked={props.value}
                onChange={(e) => props.onChange(e.target.checked)}
                disabled={props.disabled}
                />
              <span className="lever"></span>
              On
            </label>
        </div>
    )
}