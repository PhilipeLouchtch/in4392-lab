import {QueueMetrics} from "../QueueMetrics";
import SQS = require("aws-sdk/clients/sqs");
import {QueueUrl} from "../../../queue/model/QueueUrl";

export class SqsQueueMetrics implements QueueMetrics {

    constructor(private readonly queueName: string,
                private readonly queueUrl: QueueUrl,
                private readonly sqsClient: SQS) {
    }

    nameOfQueue(): string {
        return this.queueName;
    }

    getApproximateMessageCount(): Promise<number> {
        return this.getApproximateSizeOfQueue()
    }

    private async getApproximateSizeOfQueue() {
        const attrs = await this.sqsClient.getQueueAttributes({
            QueueUrl: await this.queueUrl.promise(),
            AttributeNames: ["ApproximateNumberOfMessages"]
        }).promise();

        if (attrs.Attributes)
            return Number.parseInt(attrs.Attributes.ApproximateNumberOfMessages)
        else
            return 0
    }
}