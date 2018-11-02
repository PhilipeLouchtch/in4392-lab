import { ProcessStepOneLambda } from "../../src/lambda/concrete/ProcessStepOneLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { RandomChance } from '../../src/lib/RandomChance';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { ContextBasedExecutionTime } from '../../src/lib/ContextBasedExecutionTime';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import { ValidationRules, required, type, ObjectValidator } from '../../src/lib/ObjectValidator';
import { jobParametersValidationRules } from '../../src/job/JobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })

const rules: ValidationRules<OneDeps> = {
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
        console.log("ProcessStepOne: Invoked for Job " + job.asKey())

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
