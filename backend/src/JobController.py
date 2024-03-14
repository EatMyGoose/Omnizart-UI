from typing import Tuple, Optional, Dict, Any, List
from datetime import datetime
from logging import Logger
from .schemas import JobStatus, TranscriptionJob, CompletedJob, TOmnizartMode, StatusName

class JobController:
    #returns the id of the newly created job
    @staticmethod
    async def InitJob(
        transcriptionMode: TOmnizartMode,
        srcFilename: str,
        time: datetime = datetime.now()
        ) -> int:

        newJob = (await TranscriptionJob.insert(
            TranscriptionJob(
                filename=srcFilename,
                mode=transcriptionMode,
                start_time=time,
                end_time=None,
                request_terminate=False,
                status=StatusName(JobStatus.NONE),
                msg="",
                completed_job=None
            )
        ))[0];

        return newJob["id"];

    @staticmethod
    def ShouldTerminateJob(jobId: int) -> bool:
        job: Optional[Dict[str, Any]] = (
            TranscriptionJob
                .select()
                .where(TranscriptionJob.id == jobId)
                .first()
                .run_sync()
        );
        shouldTerminate = job["request_terminate"];
        assert(isinstance(shouldTerminate, bool));
        return shouldTerminate;

    @staticmethod
    async def MarkJobForTermination(jobId: int) -> bool:
        updatedRows: List[Dict[str, Any]] = await TranscriptionJob.update({
            TranscriptionJob.request_terminate: True
        }).where(
            TranscriptionJob.id == jobId
        ).returning(
            TranscriptionJob.id
        );
    
        rowWasUpdated = len(updatedRows) > 0;
        return rowWasUpdated;

    @staticmethod
    def UpdateStatus(
        id: int, 
        newStatus: JobStatus, 
        time: datetime = datetime.now()) -> None:

        TranscriptionJob.update({
            TranscriptionJob.status: StatusName(newStatus),
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
        ).run_sync()[0];
        
        assert(not completedJob is None);
        assert(isinstance(completedJob["id"], int));

        TranscriptionJob.update({
            TranscriptionJob.completed_job: completedJob["id"]
        }).where(
            TranscriptionJob.id == parentJobId
        ).run_sync();

    @staticmethod
    async def GetCompletedJobAsync(logger: Logger, jobId: int) -> Optional[Tuple[bytes, str]]:
        completedJob = (
            await TranscriptionJob
                .select(TranscriptionJob.completed_job.filename, TranscriptionJob.completed_job.blob)
                .where(TranscriptionJob.id == jobId)
                .first()
        );

        logger.info(f"completedJob = {completedJob.keys()}");
        
        missingFile: bool = (
            completedJob is None or 
            completedJob["completed_job.blob"] is None or
            completedJob["completed_job.filename"] is None
        );

        if missingFile:
            logger.error(f"Job id<{jobId}> - missing result")
            return None;    

        return (completedJob["completed_job.blob"], completedJob["completed_job.filename"]);