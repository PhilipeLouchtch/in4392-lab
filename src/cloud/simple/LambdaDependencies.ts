import { SimpleJobParams } from '../../job/SimpleJobRequest';

// TODO Move to Lambda Implementation??
export type FeedDeps = {
    step_zero: string,
    step_one: string,
    JobRequest: SimpleJobParams,
}

export type OneDeps = {
    step_one: string,
    step_two: string,
    JobRequest: SimpleJobParams,
}

export type ReduceDeps = {
    step_two: string,
    step_three: string,
    JobRequest: SimpleJobParams,
}
