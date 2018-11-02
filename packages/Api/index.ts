import AWS = require('aws-sdk')
import { SimpleJobRequest, SimpleJobResult } from '../../src/job/SimpleJobRequest';
import { S3Persistence } from '../../src/persistence/S3Persistence';
import { JobResult } from '../../src/job/JobResult';
import { JobStatus } from '../../src/job/JobStatus';
import { JobResultPersistance } from "../../src/persistence/JobResultPersistance";

const s3Client = new AWS.S3({ region: 'us-west-2' })
const persistence = new JobResultPersistance(new S3Persistence<string>(s3Client, 'simple-jobs'));
const lambdaClient = new AWS.Lambda({ region: 'us-west-2' })

const validate = (body) =>
    !('limit' in body) ? "'limit' is a required parameter in body"
        : !('param' in body) ? "'param' is a required parameter in body"
            : null

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

export const handler = async (event, context) => {

    // Necessary for CORS preflight
    if (event.httpMethod === "OPTIONS") return response(200, { message: "confirm" })

    // Try to decode the request body
    let body;
    try {
        const json = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body
        body = JSON.parse(json)
    } catch (e) {
        return response(400, { error: "Could not parse body" })
    }

    // Validate the body
    const error = !body ? "No body provided" : validate(body)
    if (error) {
        return response(400, { error })
    }

    const job = new SimpleJobRequest({
        limit: body.limit,
        param: body.param,
    })

    const result: JobResult<SimpleJobResult> | undefined = await persistence.read(job)


    if (!result) {
        console.log("JobRequest not in storage, invoking Daemon..")
        const jobStatus = { status: JobStatus.NOT_STARTED }
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
