import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");

export class QueueUrlFromName implements QueueUrl {
    private name: string;
    private sqsClient: SQS;

    private cachedValue?: string;

    constructor(name: string, sqsClient: SQS) {
        this.name = name;
        this.sqsClient = sqsClient;
    }

    promise(): Promise<string> {
        if (this.cachedValue) {
            return Promise.resolve(this.cachedValue);
        }

        return this.sqsClient.getQueueUrl({QueueName: this.name}).promise()
        .then(result => {
            if(result.QueueUrl) {
                return result.QueueUrl
            } else {
                throw new Error(`No queue found with name ${this.name}`);
            }
        })
           
    }
}