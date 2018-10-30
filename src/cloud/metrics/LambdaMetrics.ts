import { MetricsBag } from './MetricsBag'

/**
 * A LambdaSnapshot gathers the number of concurrently
 * running lambdas.
 */
export class LambdaMetrics implements MetricsBag {

    /** The number of concurrently running lambdas */
    private numberOfActiveLambdas: number

    constructor(count: number) {
        this.numberOfActiveLambdas = count;
    }

    getNumberOfActiveLambdas() {
        return this.numberOfActiveLambdas
    }

}
