import React from "react"

export function useLoadingEllipsis(loading: boolean) : string
{
    const [nDots, setNDots] = React.useState<number>(0);

    React.useEffect(
        () => {
            if(!loading)
            {
                setNDots(0);
                return;
            }

            const handler = () => setNDots((prev) => (prev + 1) % 3);

            const timerId: number = window.setInterval(handler, 200);
            return () => window.clearInterval(timerId);
        }
    , [loading]);

    return ".".repeat(nDots);
}