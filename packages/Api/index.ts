import AWS = require('aws-sdk')
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import { S3Persistence } from '../../src/persistence/S3Persistence';

const s3Client = new AWS.S3({ region: 'us-west-2' })
const persistence = new S3Persistence(s3Client, 'simple-jobs')
const lambdaClient = new AWS.Lambda({ region: 'us-west-2' })

const validate = (body) =>
    !('limit' in body) ? "'limit' is a required parameter in body"
        : !('param' in body) ? "'param' is a required parameter in body"
            : null

const response = (statusCode: number, body: any, headers: any = {}) => ({
    "statusCode": statusCode,
    "headers": headers,
    "body": JSON.stringify(body),
    "isBase64Encoded": false
});

export const handler = async (event, context) => {

    // Try to decode the request body
    let body;
    try {
        const json = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body
        body = JSON.parse(json)
    } catch (e) {
        return response(400, { error: "Could not parse body" })
    }

    // Validate the body
    const error = validate(body)
    if (error) {
        return response(400, { error })
    }

    const job = new SimpleJobRequest({
        limit: body.limit,
        param: body.param,
    })

    const result = await persistence.read(job)

    if (!result) {
        console.log("JobRequest not in storage, invoking Daemon..")
        const payload = { JobRequest: job.parameters }
        const result = await lambdaClient.invoke({
            FunctionName: 'Daemon',
            InvocationType: "Event",
            Payload: JSON.stringify(payload),
        }).promise()
        return response(202, { message: "Job Started" })
    } else {
        console.log("JobRequest in storage, returning.")
        return response(200, { result })
    }
}
