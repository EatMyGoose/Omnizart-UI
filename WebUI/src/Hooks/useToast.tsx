import M from "materialize-css"
import ReactDomServer from 'react-dom/server';

export interface IUseToast
{
    info: (msg:string) => void,
    warning: (msg:string) => void,
    error: (msg:string) => void,
    success: (msg:string) => void,
}

export function useToast() : IUseToast
{
    function CreateToast(
        message: string,
        colorClass: "yellow accent-1" | "red accent-1" | "green accent-1" | "")
    {
        const elem = <span>{message}</span>;
        const safeHtml: string =  ReactDomServer.renderToStaticMarkup(elem);

        M.toast({html: safeHtml, classes:colorClass});
    }

    return {
        info: (msg: string) => CreateToast(msg, ""),
        warning: (msg: string) => CreateToast(msg, "yellow accent-1"),
        error: (msg: string) => CreateToast(msg, "red accent-1"),
        success: (msg: string) => CreateToast(msg, "green accent-1"),
    }
}