import { JobStatus } from './JobStatus';

export class JobResult<T> {

    private constructor(
        public readonly status: JobStatus,
        public readonly startedOn?: number,
        public readonly finishedOn?: number,
        public readonly data?: T) {
    }

    public static ofNotStarted<T>(): JobResult<T> {
        return new JobResult<T>(JobStatus.NOT_STARTED);
    }

    started(): JobResult<T> {
        return new JobResult<T>(JobStatus.RUNNING, Date.now());
    }

    completed(data: T): JobResult<T> {
        return new JobResult<T>(JobStatus.COMPLETED, this.startedOn, Date.now(), data);
    }

    failed() {
        return new JobResult<T>(JobStatus.FAILED, this.startedOn, Date.now());
    }
}
