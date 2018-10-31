import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import {TimeDurationDelay} from "../../lib/TimeDurationDelay";
import {QueueUrlFromPrefix} from "./QueueUrlFromPrefix";
import {MilliSecondBasedTimeDuration, TimeDuration, TimeUnit} from "../../lib/TimeDuration";
import { Delay } from '../../lib/Delay';

export class WaitingQueueUrl implements QueueUrl {
    private waitTime: TimeDuration;
    private queueUrlFromPrefix: QueueUrlFromPrefix;

    constructor(private readonly prefix: string, private readonly sqsClient: SQS) {
        this.queueUrlFromPrefix = new QueueUrlFromPrefix(prefix, sqsClient);
        this.waitTime = new MilliSecondBasedTimeDuration(1000, TimeUnit.milliseconds);
    }

    promise(): Promise<string> {
        // Resolve only when the QueueUrl has been provided. No max tries?
        return new Promise((resolve, reject) => {
            return this.queueUrlFromPrefix.promise()
                .then((queueUrl) => resolve(queueUrl)) // resolve when found
                .catch(() => {
                    console.log(`Could not find queue for prefix ${this.prefix}, retrying in ${this.waitTime.toMilliSeconds() } ms`);

                    // try again after waiting 1 sec
                    return new TimeDurationDelay(this.waitTime).delay()
                        .then(() => this.promise().then((queueUrl) => resolve(queueUrl)));
                });
        })
    }

}