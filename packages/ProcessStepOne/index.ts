import { ProcessStepOneLambda } from "../../src/lambda/concrete/ProcessStepOneLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { RandomChance } from '../../src/lib/RandomChance';
import { MomentBasedExecutionTime } from '../../src/lib/ExecutionTime';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';

const sqsClient = new SQS({ region: 'us-west-2' })

const validate = (event) =>
    !('step_one' in event) ? "'step_one' is a required Payload parameter"
        : !('step_two' in event) ? "'step_two' is a required Payload parameter"
            : null

export const handler = (event, context, callback) => {
    try {
        console.log("ProcessStepOne: Invoked")

        const error = validate(event)
        if (error) {
            return callback(error)
        }

        const payload: OneDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.input_queue, sqsClient))
        const stepTwoQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))
        const chance = new RandomChance(Math.random)
        const executionTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(45, TimeUnit.seconds)) // TODO Param.

        const lambda = new ProcessStepOneLambda(executionTime, stepOneQueue, stepTwoQueue, chance)

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
