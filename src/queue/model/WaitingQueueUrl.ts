import { QueueUrl } from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import {TimeDurationDelay} from "../../lib/TimeDurationDelay";
import {QueueUrlFromName} from "./QueueUrlFromName";
import {MilliSecondBasedTimeDuration, TimeDuration, TimeUnit} from "../../lib/TimeDuration";
import { Delay } from '../../lib/Delay';

export class WaitingQueueUrl implements QueueUrl {
    private waitTime: TimeDuration;
    private queueUrlFromName: QueueUrlFromName;

    constructor(private readonly name: string, private readonly sqsClient: SQS) {
        this.queueUrlFromName = new QueueUrlFromName(name, sqsClient);
        this.waitTime = new MilliSecondBasedTimeDuration(1000, TimeUnit.milliseconds);
    }

    promise(): Promise<string> {
        // Resolve only when the QueueUrl has been provided. No max tries?
        return new Promise((resolve, reject) => {
            return this.queueUrlFromName.promise()
                .then((queueUrl) => resolve(queueUrl)) // resolve when found
                .catch(() => {
                    console.log(`Could not find queue for name ${this.name}, retrying in ${this.waitTime.toMilliSeconds() } ms`);

                    // try again after waiting 1 sec
                    return new TimeDurationDelay(this.waitTime).delay()
                        .then(() => this.promise().then((queueUrl) => {
                            console.log("QURL: ", queueUrl)
                            resolve(queueUrl)
                        }));
                });
        })
    }

}