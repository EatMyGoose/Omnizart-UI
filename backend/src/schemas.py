from piccolo.table import Table
import piccolo.columns 
from enum import auto, Enum
from dataclasses import dataclass

##DB schemas
class JobStatus(Enum):
    NONE = auto()
    RUNNING = auto()
    DONE = auto()

    STOPPING = auto()
    TERMINATED = auto()

    ERROR = auto()

def IsJobDone(status: str) -> bool:
    return status in [JobStatus.DONE, JobStatus.TERMINATED, JobStatus.ERROR]


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
class ResponseJobStatus:
    status: str
    done: bool
    