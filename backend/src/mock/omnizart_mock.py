import argparse
from pathlib import Path

def main() -> None:
    parser = argparse.ArgumentParser();

    parser.add_argument(
        "mode", 
        help="transcription mode",
        choices=["music","drum","chord","vocal","vocal-contour"],
        type=str
    );

    parser.add_argument(
        "transcribe",
        type=str
    );

    parser.add_argument(
        "source_file_path",
        type=str
    )

    parser.add_argument(
        "-o",
        "--output",
        help="output path",
        type=str
    )

    args = parser.parse_args();
    
    fileNameWithoutExtension: str = Path(args.source_file_path).stem;
    outputFilePath: str = fileNameWithoutExtension + ".mid";
    if args.mode != "vocal":
        outputFilePath = args.output

    with open(outputFilePath, "w"):
        pass;

    return;

if __name__ == "__main__":
    main();

