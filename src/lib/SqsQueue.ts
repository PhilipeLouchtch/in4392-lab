import SQS = require("aws-sdk/clients/sqs");
import {ReceiveMessageRequest, SendMessageBatchRequest, SendMessageBatchRequestEntry} from "aws-sdk/clients/sqs";
import {Message} from "../source/Message";
import {message} from "aws-sdk/clients/sns";

export class SqsQueue<TMessage extends Message<string, string>> {
    private sqs: SQS;
    private queueUrl: Promise<string>;

    constructor(sqs: SQS, queueName: string) {
        this.sqs = sqs;

        this.queueUrl = this.resolveNameToUrl(queueName);
    }

    // Will create a maximum sized batch or until the provider is depleted
    public async sendBatched(msgProvider: Iterator<TMessage>) {
        return this.makeSqsBatch(msgProvider)
            .then(sendMsgBatchRequest => this.sqs.sendMessageBatch(sendMsgBatchRequest));
    }

    public async receive(): Promise<Message<string, string>[]> {

        let handleUndefined = (value: string|undefined) => value ? value : "";

        let promise = this.queueUrl.then(queueUrl => {
            return this.sqs.receiveMessage({QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();
        }).then(value => {
            if (!value.Messages) {
                // no messages received
                return [];
            }

            // Convert all messages with valid bodies to an array of strings
            let msgs = value.Messages.filter(msg => msg.Body !== undefined)
                .map(sqsMsg => {
                    let msg: Message<string,string> = {identifier: handleUndefined(sqsMsg.MessageId), data: handleUndefined(sqsMsg.Body)};
                    return msg;
                });

            return msgs;
        });

        return promise
    }

    private async makeSqsBatch(source: Iterator<TMessage>): Promise<SendMessageBatchRequest> {
        return new Promise<SendMessageBatchRequest>(async resolve => {
            let msgs : SendMessageBatchRequestEntry[] = [];
            for(let i = 0; i < 10; i++) {
                let iteratorResult = source.next();
                if (iteratorResult.done == false){
                    msgs.push({Id: iteratorResult.value.identifier, MessageBody: iteratorResult.value.data});
                }
            }

            resolve({QueueUrl: await this.queueUrl, Entries: msgs});
        });
    }

    // Resolve the given queue-name to a sqs queue url. The name is used as a prefix filter for all the available queues.
    private async resolveNameToUrl(queueName: string): Promise<string> {
        return this.sqs.listQueues({QueueNamePrefix: queueName}).promise()
            .then(value => {
                if (value.QueueUrls && value.QueueUrls[0]){
                    return value.QueueUrls[0];
                }

                // No permissions, or no queues with given prefix exists
                throw new Error(`No queue found with prefix ${queueName}`);
            });
    }
}