import { SQS } from 'aws-sdk'
import { QueueMetrics } from '../metrics/QueueMetrics'
import { HasMetrics } from '../metrics/HasMetrics'
import { QueueUrl } from "../../queue/model/QueueUrl";
import { QueueUrlOfNewOrExisting } from "../../queue/model/QueueUrlOfNewOrExisting";

/**
 * A `QueueController` controls the `SQSQueue` by spawning it.
 * For monitoring and scheduling, it can return `QueueMetrics`.
 */
export class QueueController implements HasMetrics<QueueMetrics> {

    private sqsClient: SQS
    private queueUrl: QueueUrl

    constructor(sqsClient: SQS, name: string) {
        this.sqsClient = sqsClient
        this.queueUrl = new QueueUrlOfNewOrExisting(name, sqsClient)
    }

    public spawn() {
        return this.queueUrl.promise()
    }

    async getMetrics(): Promise<QueueMetrics> {
        return new QueueMetrics(await this.getApproximateSize())
    }

    private async getApproximateSize() {
        const attrs = await this.sqsClient.getQueueAttributes({
            QueueUrl: await this.queueUrl.promise(),
            AttributeNames: ["ApproximateNumberOfMessages"]
        }).promise()

        if (attrs.Attributes)
            return Number.parseInt(attrs.Attributes.ApproximateNumberOfMessages)
        else
            return 0
    }

}
