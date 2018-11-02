import AWS = require('aws-sdk')
import { SimpleJobRequest, SimpleJobResult } from '../../src/job/SimpleJobRequest';
import { S3Persistence } from '../../src/persistence/S3Persistence';
import { JobResult } from '../../src/job/JobResult';
import { JobStatus } from '../../src/job/JobStatus';
import { JobResultPersistance } from "../../src/persistence/JobResultPersistance";
import { ObjectValidator, ValidationRules, required, type } from '../../src/lib/ObjectValidator';

const s3Client = new AWS.S3({ region: 'us-west-2' })
const persistence = new JobResultPersistance(new S3Persistence<string>(s3Client, 'simple-jobs'));
const lambdaClient = new AWS.Lambda({ region: 'us-west-2' })

const response = (statusCode: number, body: any, headers: any = {}) => ({
    "statusCode": statusCode,
    "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        ...headers
    },
    "body": JSON.stringify(body),
    "isBase64Encoded": false
});

const jobResponse = (jobId: string, jobStatus: JobResult<SimpleJobResult>) =>
    response(jobStatus.status === JobStatus.RUNNING ? 202 : 200, { jobId, result: jobStatus })

interface ApiRequestData {
    limit: number,
    param: string
}

const rules: ValidationRules<ApiRequestData> = {
    limit: [required(), type('number')],
    param: [required(), type('string')],
}
const validator = new ObjectValidator<ApiRequestData>(rules)

export const handler = async (event, context) => {

    // Necessary for CORS preflight
    if (event.httpMethod === "OPTIONS") return response(200, { message: "confirm" })

    // Parse Request, respond on failure
    let job
    try {
        job = getJobFromEvent(event)
    } catch (error) {
        return response(400, { error: error.message })
    }

    const result: JobResult<SimpleJobResult> | undefined = await persistence.read(job)

    if (!result) {
        console.log("JobRequest not in storage, invoking Daemon..")
        const jobStatus: JobResult<SimpleJobResult> = JobResult.ofNotStarted()
        await persistence.store(job, jobStatus)

        const payload = { JobRequest: job.parameters }
        await lambdaClient.invoke({
            FunctionName: 'Daemon',
            InvocationType: "Event",
            Payload: JSON.stringify(payload),
        }).promise()

        return jobResponse(job.asKey(), jobStatus)
    } else {
        console.log("JobRequest in storage, returning.")
        return jobResponse(job.asKey(), result)
    }
}

/** Ugly but effective */
function getJobFromEvent(event) {

    // First parse the body JSON
    let body
    try {
        const json = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body
        body = JSON.parse(json)
    } catch (e) {
        throw new Error("Invalid Request: Could not parse body")
    }

    // Validate body
    const error = !body ? "No body provided" : validator.validate(body).join(", ")
    if (error) {
        throw new Error("Invalid Request: " + error)
    }

    const job = new SimpleJobRequest({
        limit: body.limit,
        param: body.param,
    })

    // Validate the param
    try {
        job.decodeParameters()
    } catch (e) {
        throw new Error("Invalid Parameter: " + e)
    }

    return job

}
