import { SqsQueue } from '../../src/queue/SqsQueue';
import { WordCountDeps } from '../../src/cloud/simple/LambdaDependencies';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { WordCountLambda } from "../../src/lambda/concrete/WordCountLambda";
import SQS = require("aws-sdk/clients/sqs");
import { ContextBasedExecutionTime } from '../../src/lib/ContextBasedExecutionTime';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })

const validate = (event) =>
    !('input_queue' in event) ? "'input_queue' is a required Payload parameter"
        : !('output_queue' in event) ? "'output_queue' is a required Payload parameter"
            : !('JobRequest' in event) ? "JobRequest is a required Payload parameter"
                : !('limit' in event.JobRequest) ? "JobRequest.limit is a required Payload parameter"
                    : !('param' in event.JobRequest) ? "JobRequest.param is a required Payload parameter"
                        : null

export const handler = (event, context, callback) => {
    try {
        const job = new SimpleJobRequest(event.JobRequest)
        console.log("WordCount: Invoked for Job " + job.asKey())

        const error = validate(event)
        if (error) {
            return callback(error)
        }

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: WordCountDeps = event

        const inputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.input_queue, sqsClient))
        const outputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))

        const lambda = new WordCountLambda(execTime, inputQueue, outputQueue)

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
