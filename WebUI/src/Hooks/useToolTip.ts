import React, { useCallback } from "react";
import M from "materialize-css";

export function useToolTip(active: boolean)
{
    const [ref, setRef] = React.useState<HTMLElement | null>(null);

    React.useEffect(
        () => {
            if(ref === null || active === false) return;
 
            const tooltip = M.Tooltip.init(ref);
            return () => tooltip.destroy();
        }
    , [ref, active]);

    const callback = useCallback(
        (newNode: HTMLElement | null) => {
            setRef(newNode);
        }
        , []);

    return callback;
}   