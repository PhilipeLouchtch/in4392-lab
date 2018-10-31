import SQS = require("aws-sdk/clients/sqs");
import { SendMessageBatchRequest, SendMessageBatchRequestEntry } from "aws-sdk/clients/sqs";
import { Message } from "../source/Message";
import { QueueUrl } from "./model/QueueUrl";
import { Queue } from "./Queue";
import { AWSError } from 'aws-sdk';

export class SqsQueue<TMessage extends Message<string, string>> implements Queue<TMessage> {
    private sqsClient: SQS;
    private queueUrl: QueueUrl;

    constructor(sqsClient: SQS, queueUrl: QueueUrl) {
        this.sqsClient = sqsClient;
        this.queueUrl = queueUrl;
    }

    public async sendSingle(msg: TMessage) {
        return this.queueUrl.promise().then(queueUrl => {
            console.log(`SQSQueue: send message ${msg.identifier} to ${queueUrl}`)
            this.sqsClient.sendMessage({ QueueUrl: queueUrl, MessageBody: msg.data }).promise()
            .then((d) => {
                console.log(`SQSQueue: send successful`, d)
            }).catch((e) => {
                console.error(`SQSQueue: send failed`, e)
            })
        })
    }

    // Will create a maximum sized batch or until the provider is depleted
    public async sendBatched(msgProvider: Iterator<TMessage>) {
        return this.makeSqsBatch(msgProvider)
            .then(sendMsgBatchRequest => {
                console.log(`SQSQueue: send ${sendMsgBatchRequest.Entries.length} messages to ${sendMsgBatchRequest.QueueUrl}`)
                return this.sqsClient.sendMessageBatch(sendMsgBatchRequest).promise() // needs promise?
                .then((d) => {
                    console.log(`SQSQueue: send successful`, d)
                }).catch((e) => {
                    console.error(`SQSQueue: send failed`, e)
                })
            })
            .then(() => { }); // conform to the interface
    }

    public async receive(msgConsumer: (string) => Promise<void>, queueIsEmptyHandler: () => Promise<void>) {
        const handleUndefined = (value: string | undefined) => value ? value : "";

        const queueUrl = await this.queueUrl.promise();
        const msg = await this.sqsClient.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1, WaitTimeSeconds: 10 }).promise();

        if (!msg.Messages || msg.Messages.length == 0) {
            return queueIsEmptyHandler();
        }

        const messages = msg.Messages
            .filter(msg => msg.Body !== undefined)
            .map(sqsMsg => {
                return {
                    identifier: handleUndefined(sqsMsg.ReceiptHandle),
                    data: handleUndefined(sqsMsg.Body)
                };
            });

        return Promise.all(messages
            .map(msg => this.queueUrl.promise().then(queueUrl => {
                try {
                    msgConsumer(msg.data);
                    // remove msg from queue if processed successfully
                    return this.sqsClient.deleteMessage({
                        QueueUrl: queueUrl,
                        ReceiptHandle: msg.identifier
                    }).promise();
                }
                catch (e) {
                    console.error(`Failed to process msg ["${msg.data}"], error: ${e}`);
                    return new Promise(resolve => resolve());
                }
            })
            )).then(() => { }); // conform to the interface
    }

    private async makeSqsBatch(source: Iterator<TMessage>): Promise<SendMessageBatchRequest> {
        return new Promise<SendMessageBatchRequest>(async resolve => {
            let msgs: SendMessageBatchRequestEntry[] = [];
            for (let i = 0; i < 10; i++) {
                let iteratorResult = source.next();
                if (iteratorResult.done == false) {
                    msgs.push({ Id: iteratorResult.value.identifier, MessageBody: iteratorResult.value.data });
                }
            }

            resolve({ QueueUrl: await this.queueUrl.promise(), Entries: msgs });
        });
    }
}