import { MetricsBag } from './MetricsBag'

/**
 * A snapshot of Queue Metrics.
 * 
 * The SQS client only supports approximate message count. 
 * Gathering metrics via CloudWatch can only be done on a
 * 1-minute resolution.
 */
export interface QueueMetrics extends MetricsBag {
    nameOfQueue(): string;
    getApproximateMessageCount(): Promise<number>;
}
