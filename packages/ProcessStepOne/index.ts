import { ProcessStepOneLambda } from "../../src/lambda/concrete/ProcessStepOneLambda"
import SQS = require("aws-sdk/clients/sqs")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { QueueUrlFromPrefix } from '../../src/queue/model/QueueUrlFromPrefix';
import { OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { RandomChance } from '../../src/lib/RandomChance';
import { MomentBasedExecutionTime } from '../../src/lib/ExecutionTime';
import { MilliSecondBasedTimeDuration, TimeUnit } from '../../src/lib/TimeDuration';

const sqsClient = new SQS({ region: 'us-west-2' })

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: OneDeps = event
        const stepOneQueue = new SqsQueue(sqsClient, new QueueUrlFromPrefix(payload.step_one, sqsClient))
        const stepTwoQueue = new SqsQueue(sqsClient, new QueueUrlFromPrefix(payload.step_two, sqsClient))
        const chance = new RandomChance(Math.random)
        const executionTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(6, TimeUnit.seconds)) // TODO Param.

        const lambda = new ProcessStepOneLambda(executionTime, stepOneQueue, stepTwoQueue, chance)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
