import DaemonLambda from "../../src/lambda/concrete/DaemonLambda"
import { MilliSecondBasedTimeDuration, TimeUnit } from "../../src/lib/TimeDuration";
import { MomentBasedExecutionTime } from "../../src/lib/ExecutionTime";
import S3 = require("aws-sdk/clients/s3")
import SQS = require("aws-sdk/clients/sqs")
import Lambda = require("aws-sdk/clients/lambda")
import uuidv4 = require('uuid/v4')
import { S3Persistence } from '../persistence/S3Persistence';
import { SimpleJobRequest, SimpleJobResult } from '../job/SimpleJobRequest';
import { JobResult } from '../job/JobResult';

const sqsClient = new SQS({ region: 'us-west-2' })
const lambdaClient = new Lambda({ region: 'us-west-2' })
const s3Client = new S3({ region: 'us-west-2' })
const execTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(4, TimeUnit.minutes));
const persistence = new S3Persistence<JobResult<SimpleJobResult>>(s3Client, 'simple-jobs')

export const handler = (event, context, callback) => {
    try {
        const job = new SimpleJobRequest(event.JobRequest)
        const lambda = new DaemonLambda(execTime, sqsClient, lambdaClient, job, persistence, uuidv4())
        lambda.run();
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        callback(null, { statusCode: 500, body: { error } })
    }
}
