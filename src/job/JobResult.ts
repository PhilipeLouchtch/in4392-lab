import { JobStatus } from './JobStatus';

export class JobResult<T>{

    private constructor(
        public readonly status: JobStatus,
        public readonly startedOn?: number,
        public readonly finishedOn?: number,
        public readonly data?: T) {
    }

    public static fromSerialized<T>(serializedString: string): JobResult<T> {
        let object = JSON.parse(serializedString);
        return new JobResult(object.status, object.startedOn, object.finishedOn, object.data)
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

    serialize(): string {
        return JSON.stringify({status: this.status, startedOn: this.startedOn, finishedOn: this.finishedOn, data: this.data});
    }


}
