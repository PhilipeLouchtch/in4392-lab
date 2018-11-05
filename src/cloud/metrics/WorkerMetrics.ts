import { MetricsBag } from './MetricsBag'

/**
 * A LambdaSnapshot gathers the number of concurrently
 * running lambdas.
 */
export interface WorkerMetrics extends MetricsBag {
    nameOfFunction(): string;
    getNumberOfActiveWorkers(): Promise<number>;
}
