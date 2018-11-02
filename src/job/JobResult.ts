import { JobStatus } from './JobStatus';

export interface JobResult<T> {
    status: JobStatus,
    data?: T
}
