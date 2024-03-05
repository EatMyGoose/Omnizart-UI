import os
import subprocess
from logging import Logger
from typing import Literal, Set, Optional
from dataclasses import dataclass
import tempfile

from .sound_util import SoundUtil
from .util import GetFilenameWithoutExtension
from .JobController import JobController
from .schemas import JobStatus, TOmnizartMode


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

    @staticmethod
    def TranscribeFile(
        jobId: int,
        logger: Logger,
        musicFile, #Todo: find type annotation
        transcriptionMode: TOmnizartMode) -> None:

        JobController.UpdateStatus(jobId, JobStatus.RUNNING);

        transcriptionResult: Optional[TTranscriptionResult] = None;
        try:
            with tempfile.TemporaryDirectory() as tmp:
                srcFilePath: str = os.path.join(tmp, musicFile.name)

                with open(srcFilePath, 'wb') as hFile:
                    hFile.write(musicFile.body)

                logger.info("disk write complete");

                transcriptionResult = Transcriber.Transcribe(
                    tmp,
                    musicFile.name,
                    transcriptionMode,
                    logger
                );
                
                with open(transcriptionResult.filePath, "rb") as hFile:
                    transcribedFile: bytes = hFile.read();
                    JobController.CreateCompletedJob(
                        jobId, 
                        transcriptionResult.filePath,
                        transcribedFile
                    );        
                        
                JobController.UpdateStatus(jobId, JobStatus.DONE);
        except:
            JobController.UpdateStatus(jobId, JobStatus.ERROR);
        finally:
            if transcriptionResult.cleanupRequired:
                logger.info(f"Deleting temp file: {transcriptionResult.filePath}")
                assert(os.path.isfile(transcriptionResult.filePath))
                os.remove(transcriptionResult.filePath)


