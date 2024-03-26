import tempfile
import os
from sanic import Request, Blueprint, file, raw, json
from sanic.exceptions import SanicException
from sanic_ext import openapi
from typing import Optional, get_args, List
import asyncio

from .util import CreateLogger, GetFilenameWithExtension, GetThreadpool, ConvertDatetimeToIsoString, SanitiseFilename
from .transcriber import Transcriber, TOmnizartMode, TTranscriptionResult

from .schemas import TranscriptionJob, IsJobDone, ResponseScheduledJob, TOmnizartMode, ResponseTranscriptionJob
from .JobController import JobController

from dataclasses import asdict

transcribeBP = Blueprint("transcribe-music",  url_prefix="/music");

logger = CreateLogger(__name__);

def GetTranscriptionMode(mode: Optional[str], defaultMode: TOmnizartMode) -> TOmnizartMode:
    if mode is None:
        return defaultMode
    elif not mode in get_args(TOmnizartMode):
        return defaultMode
    else:
        return mode;

@transcribeBP.get("/status/all")
@openapi.description("Gets the status of all jobs")
@openapi.response(200, List[ResponseTranscriptionJob], "list of jobs statuses")
async def listStatus(_: Request):
    jobList = await TranscriptionJob.select();

    return json([
        ConvertDatetimeToIsoString(asdict(ResponseTranscriptionJob.FromTranscriptionJobDBO(job)))
        for job in jobList
    ]);

@transcribeBP.get("/terminate/<job_id:int>")
@openapi.description("Terminates an existing job")
@openapi.response(200, ResponseScheduledJob, "Scheduled Job")
async def cancelJob(request: Request, job_id: int):
    terminated = await JobController.MarkJobForTermination(job_id);
    if not terminated:
        raise SanicException(f"job_id <{job_id}> not found", 404);

    canceledJob = ResponseScheduledJob(job_id);
    return json(asdict(canceledJob))

@transcribeBP.get("/status/<job_id:int>")
@openapi.description("Gets the current status of a job")
@openapi.response(200, ResponseTranscriptionJob, "Job Status")
async def getStatus(_: Request, job_id: int):
    job = await TranscriptionJob.select().where(TranscriptionJob.id == job_id).first()
    if job is None:
        raise SanicException(f"job_id <{job_id}> not found", 404);
    else:
        jobStatus = ResponseTranscriptionJob.FromTranscriptionJobDBO(job);

        return json(ConvertDatetimeToIsoString(asdict(jobStatus)))
    
@transcribeBP.get("/download-result/<job_id:int>")
@openapi.description("Download the midi file generated from transcription")
@openapi.response(200, {"audio/midi": bytes}, "midi file blob")
async def getTranscriptionResult(_: Request, job_id: int):
    completedJob = await JobController.GetCompletedJobAsync(logger, job_id);
    if completedJob is None:
        raise SanicException(f"no completed job for job_id <{job_id}>", 404);
    else:
        (blob, rawFilename) = completedJob
        sanitisedFilename: str = SanitiseFilename(rawFilename);

        logger.info(f"Downloading, sanitised filename = <{sanitisedFilename}>");
        return raw(
            blob,
            headers={"Content-Disposition": f"attachment; filename={sanitisedFilename}"},
            content_type="audio/midi"
        );

@transcribeBP.post("/post-transcription-job")
@openapi.description("transcribes a .wav file into a midi file")
async def postTranscriptionJob(request: Request): 
    musicFile = request.files.get("music-file");

    if musicFile is None:
        logger.info("no file uploaded")
        raise SanicException("no file uploaded", 400);

    mode = request.args.get("mode")
    requestedMode: TOmnizartMode = GetTranscriptionMode(mode, "music");
    logger.info(f"Mode: query param <{mode}>, parsed <{requestedMode}>")

    jobId: int = await JobController.InitJob(mode, musicFile.name);

    eventLoop = asyncio.get_running_loop()

    #Fire off job in another thread
    eventLoop.run_in_executor(
        None,
        Transcriber.TranscribeFile,
        jobId, 
        logger, 
        musicFile, 
        mode
    );

    postedJob = ResponseScheduledJob(jobId);
    #return job id
    return json(asdict(postedJob))

@transcribeBP.post("/transcribe-cancellable")
@openapi.description("transcribes a .wav file into a midi file")
@openapi.response(200, ResponseScheduledJob, "Scheduled job")
async def transcribeMusicCancellable(request: Request):
    musicFile = request.files.get("music-file");

    if musicFile is None:
        logger.info("no file uploaded")
        raise SanicException("no file uploaded", 400);

    mode = request.args.get("mode")
    requestedMode: TOmnizartMode = GetTranscriptionMode(mode, "music");
    logger.info(f"Mode: query param <{mode}>, parsed <{requestedMode}>")

    if not Transcriber.IsSupportedMode(requestedMode):
        logger.warn(f"Warning, mode<{mode}> is not supported");

    logger.info("upload complete");

    jobId: int = await JobController.InitJob(requestedMode, musicFile.name);

    threadpool = GetThreadpool();

    threadpool.submit(
        Transcriber.TranscribeCancellable_Proc,
        musicFile.name,
        musicFile.body,
        requestedMode,
        logger,
        jobId
    );
    logger.info(f"Job {jobId} submitted");

    #return job id
    postedJob = ResponseScheduledJob(jobId);
    return json(asdict(postedJob))

#TODO -> Omnizart can't seem to transcribe short files
@transcribeBP.post("/transcribe")
@openapi.description("transcribes a .wav file into a midi file")
@openapi.response(200, {"audio/midi": bytes}, "midi file blob")
async def transcribeMusic(request: Request):
    musicFile = request.files.get("music-file");

    if musicFile is None:
        logger.info("no file uploaded")
        raise SanicException("no file uploaded", 400);

    mode = request.args.get("mode")
    requestedMode: TOmnizartMode = GetTranscriptionMode(mode, "music");
    logger.info(f"Mode: query param <{mode}>, parsed <{requestedMode}>")

    if not Transcriber.IsSupportedMode(requestedMode):
        logger.warn(f"Warning, mode<{mode}> is not supported");

    logger.info("upload complete");
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
                requestedMode,
                logger
            );
            
            return await file(
                transcriptionResult.filePath, 
                filename=GetFilenameWithExtension(transcriptionResult.filePath), 
                mime_type="audio/midi"
            );
    finally:
        if transcriptionResult and transcriptionResult.cleanupRequired:
            logger.info(f"Deleting temp file: {transcriptionResult.filePath}")
            assert(os.path.isfile(transcriptionResult.filePath))
            os.remove(transcriptionResult.filePath)