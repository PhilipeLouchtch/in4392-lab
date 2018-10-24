import { MetricsBag } from './MetricsBag'

/**
 * A snapshot of Queue Metrics. 
 * 
 * The SQS client only supports approximate message count. 
 * Gathering metrics via CloudWatch can only be done on a
 * 1-minute resolution.
 */
export class QueueMetrics implements MetricsBag {

    /** The approximate number of messages in the queue */
    private approximateMessageCount: number

    constructor(approximateMessageCount: number) {
        this.approximateMessageCount = approximateMessageCount;
    }

    getApproximateMessageCount() {
        return this.approximateMessageCount
    }

}
