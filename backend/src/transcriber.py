import os
import subprocess
from logging import Logger
from typing import Literal, Set
from dataclasses import dataclass

from .sound_util import SoundUtil
from .util import GetFilenameWithoutExtension

TOmnizartMode = Literal["music", "drum", "chord", "vocal", "vocal-contour"]

supportedModes: Set[TOmnizartMode] = set([
    "music",
    "vocal", 
    "vocal-contour"
]);

@dataclass
class TTranscriptionResult:
    filePath: str
    cleanupRequired: bool


#TODO -> "chord" mode has some numpy version conflict
class Transcriber:
    @staticmethod
    def IsSupportedMode(mode: TOmnizartMode) -> bool:
        return mode in supportedModes;

    @staticmethod
    def Transcribe(
        dir: str,
        srcFilename:str, 
        mode: TOmnizartMode,
        logger: Logger) -> TTranscriptionResult:
        """
            returns: Full path of the generated MIDI file 
        """

        logger.info("converting to .wav");
        srcOriginalFilePath: str = os.path.join(dir, srcFilename);

        filename: str = GetFilenameWithoutExtension(srcFilename);

        outputFilename: str = f"{filename}-{mode}";

        srcConvertedWavFilePath: str = os.path.join(dir, f"{outputFilename}.wav");
        outputPath: str = (
            os.path.join(dir, f"{outputFilename}.mid")
            if mode != "vocal" else
            f"./{outputFilename}.mid"
        )

        SoundUtil.ConvertFileToWav(
            srcOriginalFilePath,
            srcConvertedWavFilePath,
            10000 #Omnizart cannot handles files that are too short
        );
        logger.info("conversion complete");
        
        logger.info("starting transcription");
        cmd: str = "";
        if mode == "vocal":
            #Under vocal mode, the output file path argument ("-o") isn't accepted
            #Output file will simply be the input filename with the extension changed to .mid
            cmd = f'omnizart {mode} transcribe "{srcConvertedWavFilePath}"';
        else:
            cmd = f'omnizart {mode} transcribe -o "{outputPath}" "{srcConvertedWavFilePath}"';
        
        logger.info(f"Start command = {cmd}")
        completedProcess = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE)
        completedProcess.check_returncode();
        logger.info(f"Done")

        fileDeletionRequired: bool = mode == "vocal";
        return TTranscriptionResult(
            outputPath,
            fileDeletionRequired
        );
