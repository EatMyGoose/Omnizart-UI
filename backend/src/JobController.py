from typing import Tuple, Optional
from datetime import datetime
from .schemas import JobStatus, TranscriptionJob, CompletedJob, TOmnizartMode

class JobController:
    #returns the id of the newly created job
    @staticmethod
    async def InitJob(
        transcriptionMode: TOmnizartMode,
        srcFilename: str,
        time: datetime = datetime.now()
        ) -> int:

        newJob = await TranscriptionJob.insert(
            TranscriptionJob(
                filename=srcFilename,
                mode=transcriptionMode,
                start_time=time,
                end_time=None,
                request_terminate=False,
                status=JobStatus.NONE,
                msg="",
                completed_job=None
            )
        );

        return newJob["id"];

    @staticmethod
    def UpdateStatus(
        id: int, 
        newStatus: JobStatus, 
        time: datetime = datetime.now()) -> None:

        TranscriptionJob.update({
            TranscriptionJob.status: newStatus.value,
            TranscriptionJob.end_time: time
        }).where(
            TranscriptionJob.id == id
        ).run_sync();

    @staticmethod
    def CreateCompletedJob(
        parentJobId: int, 
        filename: str,
        transcribedFileContents: bytes) -> None:

        completedJob = CompletedJob.insert(
            CompletedJob(
                filename=filename,
                blob=transcribedFileContents
            )
        ).run_sync();

        TranscriptionJob.update({
            TranscriptionJob.completed_job: completedJob.id
        }).where(
            TranscriptionJob.id == parentJobId
        ).run_sync();

    @staticmethod
    async def GetCompletedJobAsync(jobId: int) -> Optional[Tuple[bytes, str]]:
        completedJob = (
            await TranscriptionJob
                .select(TranscriptionJob.completed_job)
                .where(TranscriptionJob.id == jobId)
                .first()
        );

        if completedJob is None:
            return None;    

        return (completedJob["blob"], completedJob["filename"]);