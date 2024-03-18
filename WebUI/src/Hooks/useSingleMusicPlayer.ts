import React from "react"

export interface ISingleMusicPlayer
{
    stop: () => void
    start: () => void
}

export function useSingleMusicPlayer(
    playerName: string,
    setPlayer: (string: string | undefined) => void,
    currentPlayer: string | undefined,
    stopPlayerCallback: () => void) : ISingleMusicPlayer
{
    React.useEffect(() => {
        if( currentPlayer !== undefined && 
            playerName !== currentPlayer)
        {
           stopPlayerCallback();
        }           
    }, [currentPlayer, playerName]);

    const stop = React.useCallback(() => {
        setPlayer(undefined);
    }, [setPlayer])

    const start = React.useCallback(() => {
        setPlayer(playerName);
    }, [setPlayer])

    return {
        stop,
        start
    };
}