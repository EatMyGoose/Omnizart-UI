import os
import subprocess
from logging import Logger
from typing import Literal, Final

from .sound_util import SoundUtil

TOmnizartMode = Literal["music", "drum", "chord", "vocal", "vocal-contour"]

#TODO -> "chord" mode has some numpy version conflict
class Transcriber:

    @staticmethod
    def Transcribe(
        dir: str,
        srcFilename:str, 
        destFilename: str,
        mode: TOmnizartMode,
        logger: Logger) -> str:
        """
            returns: Full path of the generated MIDI file 
        """

        logger.info("converting to .wav");
        srcOriginalFilePath: str = os.path.join(dir, srcFilename);
        srcConvertedWavFilePath: str = os.path.join(dir, "converted-to-wav.wav");
        outputPath: str = os.path.join(dir, destFilename);

        SoundUtil.ConvertFileToWav(
            srcOriginalFilePath,
            srcConvertedWavFilePath,
            10000 #Omnizart cannot handles files that are too short
        );
        logger.info("conversion complete");
        
        logger.info("starting transcription");
        cmd: Final[str] = f'omnizart {mode} transcribe -o "{outputPath}" "{srcConvertedWavFilePath}"';
        logger.info(f"Start command = {cmd}")
        subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE)
        logger.info(f"Done")

        return outputPath;
