import {Message} from "../source/Message";
import {SqsQueue} from "./SqsQueue";
import SQS = require("aws-sdk/clients/sqs");
import {QueueUrlFromPrefix} from "./model/QueueUrlFromPrefix";

export class StepTwoQueue extends SqsQueue<Message<string, string>> {
    constructor(sqsClient: SQS) {
        super(sqsClient, new QueueUrlFromPrefix("step_two", sqsClient));
    }
}