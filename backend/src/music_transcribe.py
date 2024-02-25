import tempfile
import os
import subprocess
from sanic import Request, Blueprint, file
from sanic.exceptions import SanicException
from sanic_ext import openapi
from typing import Optional, get_args

from .sound_util import SoundUtil
from .util import CreateLogger, ChangeExtension, GetFilenameWithExtension
from .transcriber import Transcriber, TOmnizartMode, TTranscriptionResult

transcribeBP = Blueprint("transcribe-music",  url_prefix="/music");

logger = CreateLogger(__name__);

def GetTranscriptionMode(mode: Optional[str], defaultMode: TOmnizartMode) -> TOmnizartMode:
    if mode is None:
        return defaultMode
    elif not mode in get_args(TOmnizartMode):
        return defaultMode
    else:
        return mode;


#TODO -> Omnizart can't seem to transcribe short files
@transcribeBP.post("/transcribe")
@openapi.description("transcribes a .wav file into a midi file")
async def transcribeMusic(request: Request):
    musicFile  = request.files.get("music-file");

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
        if transcriptionResult.cleanupRequired:
            logger.info(f"Deleting temp file: {transcriptionResult.filePath}")
            assert(os.path.isfile(transcriptionResult.filePath))
            os.remove(transcriptionResult.filePath)