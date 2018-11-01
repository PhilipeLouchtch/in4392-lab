import { SimpleJobParams } from '../../job/SimpleJobRequest';

// TODO Move to Lambda Implementation??
export type FeedDeps = {
    output_queue: string,
    JobRequest: SimpleJobParams,
}

export type OneDeps = {
    input_queue: string,
    output_queue: string,
    JobRequest: SimpleJobParams,
}

export type WordCountDeps = {
    input_queue: string,
    output_queue: string,
    JobRequest: SimpleJobParams,
}

export type ReduceDeps = {
    in_out_queue: string,
    JobRequest: SimpleJobParams,
}
