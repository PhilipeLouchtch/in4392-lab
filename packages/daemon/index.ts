import DaemonLambda from "../../src/lambda/concrete/DaemonLambda"
import { MilliSecondBasedTimeDuration, TimeUnit } from "../../src/lib/TimeDuration";
import { MomentBasedExecutionTime } from "../../src/lib/ExecutionTime";
import SQS = require("aws-sdk/clients/sqs")
import Lambda = require("aws-sdk/clients/lambda")
import uuidv4 = require('uuid/v4')

const sqsClient = new SQS({ region: 'us-west-2' })
const lambdaClient = new Lambda({ region: 'us-west-2' })
const execTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(4, TimeUnit.minutes));
const lambda = new DaemonLambda(execTime, sqsClient, lambdaClient, uuidv4())

export const handler = (event, context, callback) => {
    try {
        lambda.run();
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        callback(null, { statusCode: 500, body: { error } })
    }
}
