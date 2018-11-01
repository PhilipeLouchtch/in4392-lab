import FeedLambda from "../../src/lambda/concrete/FeedLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { SimpleSource } from '../../src/source/SimpleSource';
import { FeedDeps } from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import {ContextBasedExecutionTime} from "../../src/lib/ContextBasedExecutionTime";
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../src/lib/TimeDuration";

const sqsClient = new SQS({ region: 'us-west-2' })

const validate = (event) =>
    !('output_queue' in event) ? "'output_queue' is a required Payload parameter"
        : !('JobRequest' in event) ? "JobRequest is a required Payload parameter"
            : !('limit' in event.JobRequest) ? "JobRequest.limit is a required Payload parameter"
                : !('param' in event.JobRequest) ? "JobRequest.param is a required Payload parameter"
                    : null

export const handler = (event, context, callback) => {
    try {
        console.log("Feed: Invoked")

        const error = validate(event)
        if (error) {
            return callback(error)
        }

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: FeedDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))
        const source = new SimpleSource(event.JobRequest.param)
        const jobRequest = new SimpleJobRequest(event.JobRequest)

        const lambda = new FeedLambda(execTime, stepOneQueue, source, jobRequest)

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
