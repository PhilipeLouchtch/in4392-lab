import { JobStatus } from './JobStatus'

export interface JobData<R> {
    id: string,
    status: JobStatus,
    result?: R
}
