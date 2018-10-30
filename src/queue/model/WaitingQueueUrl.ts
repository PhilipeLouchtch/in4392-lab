import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import {MillisecondDelay} from "../../lib/MillisecondDelay";
import {QueueUrlFromPrefix} from "./QueueUrlFromPrefix";

export class WaitingQueueUrl implements QueueUrl {
    private waitTime: number;
    private queueUrlFromPrefix: QueueUrlFromPrefix;

    constructor(private readonly prefix: string, private readonly sqsClient: SQS) {
        this.queueUrlFromPrefix = new QueueUrlFromPrefix(prefix, sqsClient);
        this.waitTime = 1000;
    }

    promise(): Promise<string> {
        return this.queueUrlFromPrefix.promise()
            .catch(() => {
                console.log(`Could not find queue for prefix ${this.prefix}, retrying in ${this.waitTime}`);
                // try again after waiting 1 sec
                return new MillisecondDelay(this.waitTime).delay()
                    .then(this.promise);
            });
    }

}