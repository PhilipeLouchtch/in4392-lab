import { SummingReduceLambda } from "../../src/lambda/concrete/SummingReduceLambda"
import SQS = require("aws-sdk/clients/sqs")
import S3 = require("aws-sdk/clients/s3")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { OneDeps } from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { S3Persistence } from '../../src/persistence/S3Persistence';
import { SimpleJobParams, SimpleJobRequest, SimpleJobResult } from '../../src/job/SimpleJobRequest';
import { JobResult } from '../../src/job/JobResult';

const sqsClient = new SQS({ region: 'us-west-2' })
const s3Client = new S3({ region: 'us-west-2' })
const persistence = new S3Persistence<JobResult<SimpleJobResult>>(s3Client, 'simple-jobs')

export const handler = (event, context, callback) => {
    console.log("Event", event)
    console.log("Context", context)

    try {
        const payload: OneDeps = event
        const job = new SimpleJobRequest(event.JobRequest)
        const stepTwoQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.step_two, sqsClient))
        const lambda = new SummingReduceLambda<SimpleJobParams>(stepTwoQueue, job, persistence)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback(null, { statusCode: 500, body: { error } })
    }
}
