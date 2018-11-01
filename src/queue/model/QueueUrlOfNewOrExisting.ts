import { QueueUrl } from "./QueueUrl";
import SQS = require("aws-sdk/clients/sqs");
import { QueueUrlFromName } from "./QueueUrlFromName";
import { WaitingQueueUrl } from "./WaitingQueueUrl";

export class QueueUrlOfNewOrExisting implements QueueUrl {
    private singleRequestQueueUrl: QueueUrlFromName;
    private waitingQueueUrl: WaitingQueueUrl;

    constructor(private readonly name: string, private readonly sqsClient: SQS) {
        this.singleRequestQueueUrl = new QueueUrlFromName(name, sqsClient);
        this.waitingQueueUrl = new WaitingQueueUrl(name, sqsClient);
    }

    promise(): Promise<string> {
        return this.singleRequestQueueUrl.promise()
            .catch(() => {
                console.log(`QueueUrlOfNewOrExisting: Creating Queue..`)
                return this.sqsClient.createQueue({ QueueName: this.name }).promise()
                    .then(value => {
                        console.log(`QueueUrlOfNewOrExisting: Queue Created: `, value.QueueUrl)
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