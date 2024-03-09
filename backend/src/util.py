from sanic import Sanic
from logging import Logger, StreamHandler, Formatter
from pathlib import Path
import os
import concurrent.futures

from .constants import CONST

def GetApp() -> Sanic:
    return Sanic.get_app(CONST.APPLICATION_NAME);

def CreateLogger(name: str) -> Logger:
    logger = Logger(name);

    formatter = Formatter("[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s");

    handler = StreamHandler();
    handler.setFormatter(formatter)

    logger.addHandler(handler);

    return logger;

def ChangeExtension(
        filename: str, 
        newExtension: str #includes the dot, i.e. ".mid"
    ) -> str:
    filenameWithoutExtension: str = Path(filename).stem;
    return filenameWithoutExtension + newExtension;

def GetFilenameWithoutExtension(path: str) -> str:
    return Path(path).stem;

def GetFilenameWithExtension(path: str) -> str:
    return os.path.basename(path);


threadpool = concurrent.futures.ThreadPoolExecutor();

def GetThreadpool() -> concurrent.futures.ThreadPoolExecutor:
    return threadpool;
