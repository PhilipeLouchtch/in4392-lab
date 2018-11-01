import FeedLambda from "../../src/lambda/concrete/FeedLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { SimpleSource } from '../../src/source/SimpleSource';
import { FeedDeps } from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: FeedDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.step_one, sqsClient))
        const source = new SimpleSource(event.JobRequest.param)
        const jobRequest = new SimpleJobRequest(event.JobRequest)

        const lambda = new FeedLambda(stepOneQueue, source, jobRequest)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
