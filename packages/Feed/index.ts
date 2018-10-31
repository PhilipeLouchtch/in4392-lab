import FeedLambda from "../../src/lambda/concrete/FeedLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { QueueUrlFromPrefix } from '../../src/queue/model/QueueUrlFromPrefix';
import { SimpleSource } from '../../src/source/SimpleSource';
import { JobRequest } from '../../src/JobRequest';
import { FeedDeps } from '../../src/cloud/simple/LambdaDependencies';

const sqsClient = new SQS({ region: 'us-west-2' })

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: FeedDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new QueueUrlFromPrefix(payload.step_one, sqsClient))
        const source = new SimpleSource("hello world") // TODO Parameterize
        const jobRequest = new JobRequest(100, "hello") // TODO Parameterize

        const lambda = new FeedLambda(stepOneQueue, source, jobRequest)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
