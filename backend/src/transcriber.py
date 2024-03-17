import os
import subprocess
from logging import Logger
from typing import Literal, Set, Optional, Callable, List
from dataclasses import dataclass
import tempfile
from time import sleep
from enum import Enum, auto
import shlex

from .sound_util import SoundUtil
from .util import GetFilenameWithoutExtension, GetFilenameWithExtension
from .JobController import JobController
from .schemas import JobStatus, TOmnizartMode
from .constants import CONST

class ProcessExitStatus(Enum):
    completed = auto(),
    terminated = auto()

supportedModes: Set[TOmnizartMode] = set([
    "music",
    "vocal", 
    "vocal-contour"
]);

@dataclass
class TTranscriptionResult:
    status: ProcessExitStatus
    filePath: str
    cleanupRequired: bool

#TODO -> "chord" mode has some numpy version conflict
class Transcriber:
    @staticmethod
    def IsSupportedMode(mode: TOmnizartMode) -> bool:
        return mode in supportedModes;

    @staticmethod
    def RunCancellableProcess(
        hProcess: subprocess.Popen, 
        processKillPredicate: Callable[[], bool], #Polled periodically based on "pollingIntervalMillis", return true to kill process
        pollingIntervalSeconds: float, #Repeat interval for "processKillPredicate"
        logger: Logger
        ) -> ProcessExitStatus:
        
        def ProcessDone() -> bool:
            returnCode: Optional[int] = hProcess.poll();
            finished: bool = not returnCode is None;    
            return finished;

        while (not ProcessDone()):
            shouldTerminate = processKillPredicate();
            if shouldTerminate:
                logger.info(f"terminating subprocess: <{hProcess}>")
                hProcess.terminate();
                hProcess.wait();
                logger.info(f"subprocess terminated: <{hProcess}>")
                return ProcessExitStatus.terminated;
        
            sleep(pollingIntervalSeconds);

        subProcessError: bool = hProcess.returncode != 0;
        if subProcessError:
            raise Exception(f"Error executing subprocess <{hProcess}>, returncode = {hProcess.returncode}");
        
        return ProcessExitStatus.completed;

    #Blocking (waiting for IO)
    #Shall be executed in another Thread
    @staticmethod
    def TranscribeCancellable_Proc(
        fileNameWithExtension: str,
        fileBody: bytes,
        mode: TOmnizartMode,
        logger: Logger,
        jobId: int) -> None:

        JobController.UpdateStatus(jobId, JobStatus.RUNNING);
        transcriptionResult: Optional[TTranscriptionResult] = None;
        try:
            #Create temp dir for Omnizart's input & output files
            with tempfile.TemporaryDirectory() as tmp:
                srcFilePath: str = os.path.join(tmp, fileNameWithExtension)

                #Write source input file to temp dir
                with open(srcFilePath, 'wb') as hFile:
                    hFile.write(fileBody)
                    logger.info("disk write complete");

                #Begin transcription job,
                #The DB will be polled periodically to check if a cancel request was issued
                transcriptionResult = Transcriber.TranscribeCancellable(
                    jobId,
                    tmp,
                    fileNameWithExtension,
                    mode,
                    logger
                );

                if(transcriptionResult.status == ProcessExitStatus.terminated):
                    logger.info("Job <{jobId}> terminated, exiting");
                    JobController.UpdateStatus(jobId, JobStatus.TERMINATED);
                    return;
                
                with open(transcriptionResult.filePath, "rb") as hOutputFile:
                    logger.info("Job <{jobId}> completed, writing results");
                    filestream: bytes = hOutputFile.read();
                    outputFilename: str = GetFilenameWithExtension(transcriptionResult.filePath)     
                    JobController.CreateCompletedJob(
                        jobId, 
                        outputFilename, 
                        filestream
                    );

                JobController.UpdateStatus(jobId, JobStatus.DONE);
        except Exception as e:
            JobController.UpdateStatus(jobId, JobStatus.ERROR);
            logger.error(e);
        finally:
            fileOutsideOfTempDirNeedsToBeDeleted: bool = (
                transcriptionResult and 
                transcriptionResult.cleanupRequired
            );
            
            if fileOutsideOfTempDirNeedsToBeDeleted:
                logger.info(f"Deleting temp file: {transcriptionResult.filePath}")
                assert(os.path.isfile(transcriptionResult.filePath))
                os.remove(transcriptionResult.filePath)

    @staticmethod
    def _GetProcessName(logger: Logger) -> str:
        if CONST.MOCK_OMNIZART == False:
            return "omnizart"
        elif CONST.MOCK_OMNIZART_ERROR: 
            logger.info("[MOCK] Using error mocking process");
            return "python src/mock/omnizart_error_mock.py";
        else:
            logger.info("[MOCK] Using mock process");
            return "python src/mock/omnizart_mock.py";

    @staticmethod
    def TranscribeCancellable(
        jobId: int,
        dir: str,
        srcFilename:str, 
        mode: TOmnizartMode,
        logger: Logger) -> TTranscriptionResult:

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
        processName: str = Transcriber._GetProcessName(logger);
        
        if mode == "vocal":
            #Under vocal mode, the output file path argument ("-o") isn't accepted
            #Output file will simply be the input filename with the extension changed to .mid
            cmd = f'{processName} {mode} transcribe "{srcConvertedWavFilePath}"';
        else:
            cmd = f'{processName} {mode} transcribe -o "{outputPath}" "{srcConvertedWavFilePath}"';
        
        cmdList: List[str] = shlex.split(cmd);
        logger.info(f"Start command = {cmdList}")
        transcriptionProcess = subprocess.Popen(
            cmdList,
            shell=False
        );
        exitStatus = Transcriber.RunCancellableProcess(
            transcriptionProcess,
            lambda : JobController.ShouldTerminateJob(jobId),
            5,
            logger
        )

        if exitStatus == ProcessExitStatus.terminated:
            return TTranscriptionResult(
                ProcessExitStatus.terminated,
                "",
                False
            );
    
        logger.info(f"Done")

        fileDeletionRequired: bool = mode == "vocal";
        return TTranscriptionResult(
            ProcessExitStatus.completed,
            outputPath,
            fileDeletionRequired
        );

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
            ProcessExitStatus.completed,
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
        except Exception as e:
            logger.error(e);
            JobController.UpdateStatus(jobId, JobStatus.ERROR);
        finally:
            if transcriptionResult.cleanupRequired:
                logger.info(f"Deleting temp file: {transcriptionResult.filePath}")
                assert(os.path.isfile(transcriptionResult.filePath))
                os.remove(transcriptionResult.filePath)


