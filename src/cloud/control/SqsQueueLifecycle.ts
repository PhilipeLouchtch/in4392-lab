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

    constructor(private readonly sqsClient: SQS, public readonly queueName: string) {
        this.queueUrl = new QueueUrlOfNewOrExisting(this.queueName, sqsClient)
    }

    public async spawn(): Promise<any> {
        console.log(`QueueController(${this.queueName}): spawn`)
        return this.queueUrl.promise()
    }

    public async teardown() {
        const deleteQueueRequest: DeleteQueueRequest = {QueueUrl: await this.queueUrl.promise()};
        console.log(`tearing down queue: ${deleteQueueRequest.QueueUrl}`)
        return this.sqsClient.deleteQueue(deleteQueueRequest).promise();
    }

    /**
     * Now just a convenience method
     */
    async getMetrics(): Promise<QueueMetrics> {
        return new SqsQueueMetrics(this.queueName, this.queueUrl, this.sqsClient);
    }
}
