import { SqsQueue } from '../../src/queue/SqsQueue';
import { WordCountDeps, OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { WordCountLambda } from "../../src/lambda/concrete/WordCountLambda";
import SQS = require("aws-sdk/clients/sqs");
import { ContextBasedExecutionTime } from '../../src/lib/ContextBasedExecutionTime';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import { ValidationRules, required, type, ObjectValidator } from '../../src/lib/ObjectValidator';
import { jobParametersValidationRules } from '../../src/job/JobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })

const rules: ValidationRules<WordCountDeps> = {
    output_queue: [required(), type('string')],
    input_queue: [required(), type('string')],
    JobRequest: [required(), jobParametersValidationRules],
}
const validator = new ObjectValidator<OneDeps>(rules)

export const handler = (event, context, callback) => {
    try {
        try {
            validator.validate(event)
        } catch (error) {
            return callback({ error })
        }
        const job = new SimpleJobRequest(event.JobRequest)
        console.log("WordCount: Invoked for Job " + job.asKey())

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
