export interface ReduceOperation<TIn, TOut> {
    reduce(one: TIn, two: TIn): TOut;
}