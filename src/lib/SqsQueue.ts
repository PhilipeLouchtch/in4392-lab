import SQS = require("aws-sdk/clients/sqs");
import {Lazy} from "./Lazy";
import {Message, SendMessageBatchRequest, SendMessageBatchRequestEntry} from "aws-sdk/clients/sqs";
import {QueueUrl, QueueUrl} from "aws-sdk/clients/iot";

export class SqsQueue<T> {
    private sqs: SQS;
    private queueUrl: Lazy<Promise<string>>;

    constructor(sqs: SQS, queueName: string) {
        this.sqs = sqs;
        this.queueUrl = new Lazy<Promise<string>>(() => {
            return this.resolveNameToUrl(queueName);
        })
    }

    async run() {

        let dataLimit = this.job.limit;

        // hacky promise chain of batches
        let promise = new Promise(resolve => resolve());
        for (let i = 0; i < dataLimit; i += 10) {
            promise.then(() => {
                return this.sqs.sendMessageBatch(this.makeSqsBatch(dataQueueUrl)).promise();
            })
        }

        return promise;
    }

    private makeSqsBatch(queueUrl: string) : SendMessageBatchRequest {
        let msgs = [];
        for(let i = 0; i < 10; i++) {
            let iteratorResult = this.source.next();

            if (iteratorResult.done == false){
                msgs.push(iteratorResult.value);
            }
        }

        return {QueueUrl: queueUrl, Entries: msgs}
    }

    // Will create a maximum sized batch or until the provider is depleted
    public async sendBatched(msgProvider: Iterator<T>) {

        let msgs = [];
        for(let i = 0; i < 10; i++) {
            let iteratorResult = msgProvider.next();

            if (iteratorResult.done) {
                break;
            }

            let msg = {Id: 1; Message: iteratorResult.value}
            msgs.push(msg)
        }

        return this.queueUrl.get()
            .then(url => new SendMsgBatchReq(url, msgs))
            .then(batchRequest => {
                this.sqs.sendMessageBatch(batchRequest, undefined)
            });
    }

    // This a lazy-init function
    private async resolveNameToUrl(queueName: string): Promise<string> {
        return this.sqs.listQueues({QueueNamePrefix: queueName}).promise()
            .then(value => {
                if (value.QueueUrls && value.QueueUrls[0])
                    return value.QueueUrls[0];
                else
                    throw new Error(`No queue found with prefix ${queueName}`);
            });
    }
}

class SendMsgBatchReq<T> implements SendMessageBatchRequest {
    Entries: SQS.SendMessageBatchRequestEntryList;
    QueueUrl: string;

    constructor(QueueUrl: string, Entries: T[]) {
        this.Entries = Entries;
        this.QueueUrl = QueueUrl;
    }
}