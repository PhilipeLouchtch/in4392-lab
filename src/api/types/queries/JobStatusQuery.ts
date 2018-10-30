import { Endpoints } from '../Endpoints'

export interface JobStatusQuery {
    endpoint: Endpoints.JobStatus,
    jobId: string,
}
