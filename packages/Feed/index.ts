import FeedLambda from "../../src/lambda/concrete/FeedLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { SimpleSource } from '../../src/source/SimpleSource';
import { FeedDeps } from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import {ContextBasedExecutionTime} from "../../src/lib/ContextBasedExecutionTime";
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../src/lib/TimeDuration";
import { ValidationRules, required, type, ObjectValidator } from '../../src/lib/ObjectValidator';
import { jobParametersValidationRules } from '../../src/job/JobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })

const rules: ValidationRules<FeedDeps> = {
    output_queue: [required(), type('string')],
    JobRequest: [required(), jobParametersValidationRules],
}
const validator = new ObjectValidator<FeedDeps>(rules)

export const handler = (event, context, callback) => {
    try {
        try {
            validator.validate(event)
        } catch (error) {
            return callback({ error })
        }

        const job = new SimpleJobRequest(event.JobRequest)
        console.log("Feed: Invoked for Job " + job.asKey())

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: FeedDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))
        const source = new SimpleSource(event.JobRequest.param)

        const lambda = new FeedLambda(execTime, stepOneQueue, source, job)

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
