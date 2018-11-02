import { ProcessStepOneLambda } from "../../src/lambda/concrete/ProcessStepOneLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { RandomChance } from '../../src/lib/RandomChance';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
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
        console.log("ProcessStepOne: Invoked for Job " + job.asKey())

        const error = validate(event)
        if (error) {
            return callback(error)
        }

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: OneDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.input_queue, sqsClient))
        const stepTwoQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))
        const chance = new RandomChance(Math.random)

        const lambda = new ProcessStepOneLambda(execTime, stepOneQueue, stepTwoQueue, chance)

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
