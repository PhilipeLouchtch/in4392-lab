import {SummingReduceLambda} from "../../src/lambda/concrete/SummingReduceLambda"
import {SqsQueue} from '../../src/queue/SqsQueue';
import {ReduceDeps} from '../../src/cloud/simple/LambdaDependencies';
import {WaitingQueueUrl} from '../../src/queue/model/WaitingQueueUrl';
import {S3Persistence} from '../../src/persistence/S3Persistence';
import {SimpleJobParameters, SimpleJobRequest} from '../../src/job/SimpleJobRequest';
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../src/lib/TimeDuration";
import {ContextBasedExecutionTime} from "../../src/lib/ContextBasedExecutionTime";
import {JobResultPersistance} from "../../src/persistence/JobResultPersistance";
import SQS = require("aws-sdk/clients/sqs");
import S3 = require("aws-sdk/clients/s3");
import { ValidationRules, type, required, ObjectValidator } from '../../src/lib/ObjectValidator';
import { jobParametersValidationRules } from '../../src/job/JobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })
const s3Client = new S3({ region: 'us-west-2' })
const persistence = new JobResultPersistance(new S3Persistence<string>(s3Client, 'simple-jobs'));

const rules: ValidationRules<ReduceDeps> = {
    in_out_queue: [required(), type('string')],
    JobRequest: [required(), jobParametersValidationRules],
}
const validator = new ObjectValidator<ReduceDeps>(rules)

export const handler = (event, context, callback) => {
    try {
        try {
            validator.validate(event)
        } catch (error) {
            return callback({ error })
        }

        const job = new SimpleJobRequest(event.JobRequest)
        console.log("SummingReduce: Invoked for Job " + job.asKey())

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const payload: ReduceDeps = event
        const inputQueue = new SqsQueue(sqsClient, new WaitingQueueUrl(payload.in_out_queue, sqsClient))

        const lambda = new SummingReduceLambda<SimpleJobParameters>(execTime, inputQueue, job, persistence)
        
        lambda.run();
        
        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        console.error(error)
        callback({ error })
    }
}
