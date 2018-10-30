import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import {TimeDurationDelay} from "../../lib/TimeDurationDelay";
import {QueueUrlFromPrefix} from "./QueueUrlFromPrefix";
import {MilliSecondBasedTimeDuration, TimeDuration, TimeUnit} from "../../lib/TimeDuration";

export class WaitingQueueUrl implements QueueUrl {
    private waitTime: TimeDuration;
    private queueUrlFromPrefix: QueueUrlFromPrefix;

    constructor(private readonly prefix: string, private readonly sqsClient: SQS) {
        this.queueUrlFromPrefix = new QueueUrlFromPrefix(prefix, sqsClient);
        this.waitTime = new MilliSecondBasedTimeDuration(1000, TimeUnit.milliseconds);
    }

    promise(): Promise<string> {
        return this.queueUrlFromPrefix.promise()
            .catch(() => {
                console.log(`Could not find queue for prefix ${this.prefix}, retrying in ${this.waitTime}`);
                // try again after waiting 1 sec
                return new TimeDurationDelay(this.waitTime).delay()
                    .then(this.promise);
            });
    }

}