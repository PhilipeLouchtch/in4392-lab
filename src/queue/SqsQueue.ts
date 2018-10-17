import SQS = require("aws-sdk/clients/sqs");
import {SendMessageBatchRequest, SendMessageBatchRequestEntry} from "aws-sdk/clients/sqs";
import {Message} from "../source/Message";
import {QueueUrl} from "./model/QueueUrl";
import {Queue} from "./Queue";

export class SqsQueue<TMessage extends Message<string, string>> implements Queue<TMessage> {
    private sqsClient: SQS;
    private queueUrl: QueueUrl;

    constructor(sqsClient: SQS, queueUrl: QueueUrl) {
        this.sqsClient = sqsClient;
        this.queueUrl = queueUrl;
    }

    // Will create a maximum sized batch or until the provider is depleted
    public async sendBatched(msgProvider: Iterator<TMessage>): Promise<void> {
        return this.makeSqsBatch(msgProvider)
            .then(sendMsgBatchRequest => this.sqsClient.sendMessageBatch(sendMsgBatchRequest))
            .then(() => {}); // conform to the interface
    }

    public async receive(msgConsumer: (string) => Promise<void>) {

        let handleUndefined = (value: string|undefined) => value ? value : "";

        let promise = this.queueUrl.promise().then(
            queueUrl => this.sqsClient.receiveMessage({QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise()

        ).then(
            value => value.Messages ? value.Messages : []

        ).then(messages =>
            // Convert all messages with valid bodies to an array of strings
            messages.filter(msg => msg.Body !== undefined)
                .map(sqsMsg => {
                    return {identifier: handleUndefined(sqsMsg.ReceiptHandle), data: handleUndefined(sqsMsg.Body)};
                })

        ).then(msgs => {
            return Promise.all(
                msgs.map(msg => this.queueUrl.promise().then(queueUrl => {
                    try {
                        msgConsumer(msg.data);
                        // remove msg from queue if processed successfully
                        return this.sqsClient.deleteMessage({QueueUrl: queueUrl, ReceiptHandle: msg.identifier}).promise();
                    }
                    catch (e) {
                        console.error(`Failed to process msg ["${msg.data}"], error: ${e}`);
                        return new Promise(resolve => resolve());
                    }

                })
            ));
        }).then(() => {}); // conform to the interface

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

            resolve({QueueUrl: await this.queueUrl.promise(), Entries: msgs});
        });
    }

    // Resolve the given queue-name to a sqs queue url. The name is used as a prefix filter for all the available queues.
    private async resolveNameToUrl(queueName: string): Promise<string> {
        return this.sqsClient.listQueues({QueueNamePrefix: queueName}).promise()
            .then(value => {
                if (value.QueueUrls && value.QueueUrls[0]){
                    return value.QueueUrls[0];
                }

                // No permissions, or no queues with given prefix exists
                throw new Error(`No queue found with prefix ${queueName}`);
            });
    }
}