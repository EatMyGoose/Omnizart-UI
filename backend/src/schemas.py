from piccolo.table import Table
import piccolo.columns 
from enum import auto, Enum
from dataclasses import dataclass
from typing import Literal, Optional, Dict, Any
from datetime import datetime

TOmnizartMode = Literal["music", "drum", "chord", "vocal", "vocal-contour"]

##DB schemas
class JobStatus(Enum):
    NONE = auto()
    RUNNING = auto()
    DONE = auto()

    STOPPING = auto()
    TERMINATED = auto()

    ERROR = auto()

def StatusName(status: JobStatus) -> str:
    return status.name;

def IsJobDone(status: str) -> bool:
    return status in [
        StatusName(JobStatus.DONE), 
        StatusName(JobStatus.TERMINATED), 
        StatusName(JobStatus.ERROR)
    ]

class CompletedJob(Table):
    filename = piccolo.columns.Text()
    blob = piccolo.columns.Bytea()

class TranscriptionJob(Table):
    filename = piccolo.columns.Text()
    mode = piccolo.columns.Text()
    start_time = piccolo.columns.Timestamp()
    end_time = piccolo.columns.Timestamp(null=True)

    request_terminate = piccolo.columns.Boolean()
    status = piccolo.columns.Text()

    msg = piccolo.columns.Text()

    completed_job = piccolo.columns.ForeignKey(references=CompletedJob, null=True)


def CreateAllTables() -> None:
    CompletedJob.create_table(if_not_exists=True).run_sync();
    TranscriptionJob.create_table(if_not_exists=True).run_sync();

##Response bodies

@dataclass 
class ResponseScheduledJob:
    id: int

@dataclass
class ResponseTranscriptionJob:
    id: int

    filename: str
    mode: str
    start_time: datetime
    end_time: Optional[datetime]

    request_terminate: bool
    status: str

    msg: str

    done: bool

    @staticmethod
    def FromTranscriptionJobDBO(job:Dict[str, Any]) -> "ResponseTranscriptionJob": 
        return ResponseTranscriptionJob(
            id=job["id"],
            filename=job["filename"],
            mode=job["mode"],
            start_time=job["start_time"],
            end_time=job["end_time"],
            request_terminate=job["request_terminate"],
            status=job["status"],
            msg=job["msg"],
            done=IsJobDone(job["status"])
        );

    