import { SummingReduceLambda } from "../../src/lambda/concrete/SummingReduceLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import {OneDeps, ReduceDeps} from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';

const sqsClient = new SQS({ region: 'us-west-2' })

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: ReduceDeps = event
        const inputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.input_queue, sqsClient))
        const lambda = new SummingReduceLambda(inputQueue)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
