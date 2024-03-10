export function cx(...classes: string[])
{
    return  classes.join(" ");
}

export function GetFilenameWithoutExtension(filename:string)
{
  return filename.split(".")[0];
}