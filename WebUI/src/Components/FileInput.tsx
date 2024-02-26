import React from "react"

export interface IFileInput
{
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    accept?: string
    disabled?: boolean
    id?: string
}

export function FileInput(props: IFileInput)
{
    const [filename, setFilename] = React.useState<string>("");

    function onFileChanged(e: React.ChangeEvent<HTMLInputElement>)
    {   
        if(e.target.files)
        {
            const filename: string = (
                e.target.files.length > 0? 
                    e.target.files[0].name:
                    ""
            );
            setFilename(filename);
            props.onChange(e);
        }
    }

    return (
        <>
            <form action="#">
                <div className="file-field input-field">
                <div className="btn">
                    <span>File</span>
                    <input 
                        type="file"
                        accept={props.accept}
                        disabled={props.disabled}
                        onChange={onFileChanged}
                        id={props.id}
                    />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" value={filename}/>
                </div>
                </div>
            </form>
        </>
    )
}