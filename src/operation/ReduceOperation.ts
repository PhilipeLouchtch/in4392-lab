export interface ReduceOperation<T> {
    reduce(one: T, two: T): T;
}