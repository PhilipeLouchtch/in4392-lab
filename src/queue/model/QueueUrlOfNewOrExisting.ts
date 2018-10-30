import {QueueUrl} from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import {QueueUrlFromPrefix} from "./QueueUrlFromPrefix";
import {WaitingQueueUrl} from "./WaitingQueueUrl";

export class QueueUrlOfNewOrExisting implements QueueUrl {
    private singleRequestQueueUrl: QueueUrlFromPrefix;
    private waitingQueueUrl: WaitingQueueUrl;

    constructor(private readonly name: string, private readonly sqsClient: SQS) {
        this.singleRequestQueueUrl = new QueueUrlFromPrefix(name, sqsClient);
        this.waitingQueueUrl = new WaitingQueueUrl(name, sqsClient);
    }

    promise(): Promise<string> {
        return this.singleRequestQueueUrl.promise()
            .catch(() => {
                return this.sqsClient.createQueue({QueueName: this.name}).promise()
                    .then(value => {
                        if (value.QueueUrl) {
                            // should have received the url of created queue
                            return value.QueueUrl;
                        }
                        else {
                            // if for some reason, did not, chain into a waiting-implementation
                            // will wait untill it exists
                            return this.waitingQueueUrl.promise();
                        }
                    });
            });
    }
}