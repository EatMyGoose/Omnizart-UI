import React from "react"

export function useObjectURL(
    blob: Blob | File | undefined, 
    ready: boolean) : string | undefined
{
    const prevObjectRef = React.useRef<string | undefined>(undefined);

    const objectURL = React.useMemo(() => {
        if(blob && ready)
        {
            if(prevObjectRef.current)
            {
                URL.revokeObjectURL(prevObjectRef.current);
            }

            prevObjectRef.current = URL.createObjectURL(blob);
            return prevObjectRef.current;
        }
        else 
        {
            return undefined;
        }
    }, [blob, ready])

    return objectURL;
}