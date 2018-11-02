import { MilliSecondBasedTimeDuration, TimeUnit } from "../../src/lib/TimeDuration";
import S3 = require("aws-sdk/clients/s3")
import SQS = require("aws-sdk/clients/sqs")
import Lambda = require("aws-sdk/clients/lambda")
import uuidv4 = require('uuid/v4')
import { S3Persistence } from '../../src/persistence/S3Persistence';
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import { ContextBasedExecutionTime } from '../../src/lib/ContextBasedExecutionTime';
import {JobResultPersistance} from "../../src/persistence/JobResultPersistance";
import DaemonLambda from "../../src/lambda/concrete/DaemonLambda";
import { ValidationRules, required, ObjectValidator } from '../../src/lib/ObjectValidator';
import { DaemonDeps } from '../../src/cloud/simple/LambdaDependencies';
import { jobParametersValidationRules } from '../../src/job/JobRequest';

const sqsClient = new SQS({ region: 'us-west-2' })
const lambdaClient = new Lambda({ region: 'us-west-2' })
const s3Client = new S3({ region: 'us-west-2' })
const persistence = new JobResultPersistance(new S3Persistence<string>(s3Client, 'simple-jobs'));


const rules: ValidationRules<DaemonDeps> = {
    JobRequest: [required(), jobParametersValidationRules],
}
const validator = new ObjectValidator<DaemonDeps>(rules)

export const handler = (event, context, callback) => {
    try {
        try {
            validator.validate(event)
        } catch (error) {
            return callback({ error })
        }

        const job = new SimpleJobRequest(event.JobRequest)
        console.log("Daemon: Invoked for Job " + job.asKey())

        const margin = new MilliSecondBasedTimeDuration(10, TimeUnit.seconds)
        const execTime = new ContextBasedExecutionTime(context, margin);

        const lambda = new DaemonLambda(execTime, sqsClient, lambdaClient, job, persistence, job.asKey())

        lambda.run();

        callback(null, { statusCode: 200, body: { message: "ok" } })
    } catch (error) {
        callback({ error })
    }
}
