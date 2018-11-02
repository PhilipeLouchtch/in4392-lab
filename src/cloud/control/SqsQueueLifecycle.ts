import { SQS } from 'aws-sdk'
import { QueueMetrics } from '../metrics/QueueMetrics'
import { HasMetrics } from '../metrics/HasMetrics'
import { QueueUrl } from "../../queue/model/QueueUrl";
import { QueueUrlOfNewOrExisting } from "../../queue/model/QueueUrlOfNewOrExisting";
import {SqsQueueMetrics} from "../metrics/concrete/SqsQueueMetrics";
import {DeleteQueueRequest} from "aws-sdk/clients/sqs";

/**
 * A `QueueController` controls the `SQSQueue` by spawning it.
 * For monitoring and scheduling, it can return `QueueMetrics`.
 */
export class SqsQueueLifecycle implements HasMetrics<QueueMetrics> {

    private queueUrl: QueueUrl

    constructor(private readonly sqsClient: SQS, public readonly name: string) {
        this.queueUrl = new QueueUrlOfNewOrExisting(this.name, sqsClient)
    }

    public async spawn() {
        console.log(`QueueController(${this.name}): spawn`)
        return this.queueUrl.promise()
    }

    public async teardown() {
        const deleteQueueRequest: DeleteQueueRequest = {QueueUrl: await this.queueUrl.promise()};
        return this.sqsClient.deleteQueue(deleteQueueRequest).promise();
    }

    /**
     * Now just a convenience method
     */
    async getMetrics(): Promise<QueueMetrics> {
        return new SqsQueueMetrics(this.queueUrl, this.sqsClient);
    }
}
