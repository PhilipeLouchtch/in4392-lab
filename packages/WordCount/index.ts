import {SqsQueue} from '../../src/queue/SqsQueue';
import {WordCountDeps} from '../../src/cloud/simple/LambdaDependencies';
import {MomentBasedExecutionTime} from '../../src/lib/ExecutionTime';
import {MilliSecondBasedTimeDuration, TimeUnit} from '../../src/lib/TimeDuration';
import {WaitingQueueUrl} from '../../src/queue/model/WaitingQueueUrl';
import {WordCountLambda} from "../../src/lambda/concrete/WordCountLambda";
import SQS = require("aws-sdk/clients/sqs");

const sqsClient = new SQS({ region: 'us-west-2' })

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: WordCountDeps = event

        const inputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.input_queue, sqsClient))
        const outputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.output_queue, sqsClient))
        const executionTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(45, TimeUnit.seconds)) // TODO Param.

        const lambda = new WordCountLambda(executionTime, inputQueue, outputQueue)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
