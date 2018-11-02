import { SummingReduceLambda } from "../../src/lambda/concrete/SummingReduceLambda"
import SQS = require("aws-sdk/clients/sqs")
import S3 = require("aws-sdk/clients/s3")
import { SqsQueue } from '../../src/queue/SqsQueue';
import { ReduceDeps } from '../../src/cloud/simple/LambdaDependencies';
import { WaitingQueueUrl } from '../../src/queue/model/WaitingQueueUrl';
import { S3Persistence } from '../../src/persistence/S3Persistence';
import { SimpleJobParams, SimpleJobRequest, SimpleJobResult } from '../../src/job/SimpleJobRequest';
import { JobResult } from '../../src/job/JobResult';
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../src/lib/TimeDuration";
import {ContextBasedExecutionTime} from "../../src/lib/ContextBasedExecutionTime";

const sqsClient = new SQS({ region: 'us-west-2' })
const s3Client = new S3({ region: 'us-west-2' })
const persistence = new S3Persistence<JobResult<SimpleJobResult>>(s3Client, 'simple-jobs')

const validate = (event) =>
    !('in_out_queue' in event) ? "'in_out_queue' is a required Payload parameter"
        : !('JobRequest' in event) ? "JobRequest is a required Payload parameter"
            : !('limit' in event.JobRequest) ? "JobRequest.limit is a required Payload parameter"
                : !('param' in event.JobRequest) ? "JobRequest.param is a required Payload parameter"
                    : null

export const handler = (event, context, callback) => {
    try {
        const job = new SimpleJobRequest(event.JobRequest)
        console.log("SummingReduce: Invoked for Job " + job.asKey())

        const error = validate(event)
        if (error) {
            return callback(error)
        }

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: ReduceDeps = event
        const inputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.in_out_queue, sqsClient))

        const lambda = new SummingReduceLambda<SimpleJobParams>(execTime, inputQueue, job, persistence)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
