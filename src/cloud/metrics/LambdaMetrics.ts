import { MetricsBag } from './MetricsBag'

/**
 * A LambdaSnapshot gathers the number of concurrently
 * running lambdas.
 */
export class LambdaMetrics implements MetricsBag {

    /** The number of concurrently running lambdas */
    private count: number

    constructor(count: number) {
        this.count = count;
    }

    getCount() {
        return this.count
    }

}
