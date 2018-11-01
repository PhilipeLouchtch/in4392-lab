import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");

export class QueueUrlFromPrefix implements QueueUrl {
    private prefix: string;
    private sqsClient: SQS;

    private cachedValue?: string;

    constructor(prefix: string, sqsClient: SQS) {
        this.prefix = prefix;
        this.sqsClient = sqsClient;
    }

    promise(): Promise<string> {
        if (this.cachedValue) {
            return Promise.resolve(this.cachedValue);
        }

        console.log(`QueueUrlFromPrefix: Fetching Queue URL..`)

        return this.sqsClient.listQueues({QueueNamePrefix: this.prefix}).promise()
            .then(value => {
                if (value.QueueUrls && value.QueueUrls[0]) {
                    this.cachedValue = value.QueueUrls[0];
                    console.log(`QueueUrlFromPrefix: QueueUrl Found: ${this.cachedValue}`)
                    return this.cachedValue;
                }
                console.log(`QueueUrlFromPrefix: No Queue Found`)

                // No permissions, or no queues with given prefix exists
                throw new Error(`No queue found for prefix ${this.prefix}`);
            });
    }
}
