import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");

export class QueueUrlFromPrefix implements QueueUrl {
    private prefix: string;
    private sqsClient: SQS;

    constructor(prefix: string, sqsClient: SQS) {
        this.prefix = prefix;
        this.sqsClient = sqsClient;
    }

    promise(): Promise<string> {
        return this.sqsClient.listQueues({QueueNamePrefix: this.prefix}).promise()
            .then(value => {
                if (value.QueueUrls && value.QueueUrls[0]) {
                    return value.QueueUrls[0];
                }

                // No permissions, or no queues with given prefix exists
                throw new Error(`No queue found for prefix ${this.prefix}`);
            });
    }
}