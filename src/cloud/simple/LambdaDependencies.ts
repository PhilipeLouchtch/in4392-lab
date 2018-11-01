// TODO Move to Lambda Implementation??
export type FeedDeps = {
    step_zero: string,
    step_one: string
}

export type OneDeps = {
    step_one: string,
    step_two: string
}

export type WordCountDeps = {
    input_queue: string,
    output_queue: string,
}

export type ReduceDeps = {
    step_two: string,
    step_three: string
}
