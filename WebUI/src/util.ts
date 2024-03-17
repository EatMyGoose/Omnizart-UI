export function cx(...classes: string[])
{
    return  classes.join(" ");
}

export function GetFilenameWithoutExtension(filename:string)
{
  return filename.split(".")[0];
}

export function IsSuccessfulResponse(code: number) : boolean
{
  return code >= 200 && code < 300;
}