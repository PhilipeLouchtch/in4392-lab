import {Message} from "../source/Message";
import {SqsQueue} from "./SqsQueue";
import {WaitingQueueUrl} from "./model/WaitingQueueUrl";
import SQS = require("aws-sdk/clients/sqs");

export class StepTwoQueue extends SqsQueue<Message<string, string>> {
    constructor(sqsClient: SQS) {
        super(sqsClient, new WaitingQueueUrl("step_two", sqsClient));
    }
}