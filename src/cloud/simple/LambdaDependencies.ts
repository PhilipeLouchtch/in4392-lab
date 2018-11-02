import { JobParameters } from '../../job/JobRequest';

export type DaemonDeps = {
    JobRequest: JobParameters,
}


// TODO Move to Lambda Implementation??
export type FeedDeps = {
    output_queue: string,
    JobRequest: JobParameters,
}

export type OneDeps = {
    input_queue: string,
    output_queue: string,
    JobRequest: JobParameters,
}

export type WordCountDeps = {
    input_queue: string,
    output_queue: string,
    JobRequest: JobParameters,
}

export type ReduceDeps = {
    in_out_queue: string,
    JobRequest: JobParameters,
}
