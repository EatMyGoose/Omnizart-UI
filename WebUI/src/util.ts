export function cx(...classes: string[])
{
    return  classes.join(" ");
}

export function GetFilenameWithouExtension(filename:string)
{
  return filename.split(".")[0];
}