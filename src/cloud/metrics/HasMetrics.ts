import { MetricsBag } from './MetricsBag'

/**
 * Cloud Component Controllers should monitor themselves and return a
 * metrics of their performance when requested
 */
export interface HasMetrics<T extends MetricsBag> {

    getMetrics(): T

}
