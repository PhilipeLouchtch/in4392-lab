import AWS = require('aws-sdk')
import { SimpleJobRequest } from '../../src/job/SimpleJobRequest';
import { S3Persistence } from '../../src/persistence/S3Persistence';

const s3Client = new AWS.S3({ region: 'us-west-2' })
const persistence = new S3Persistence(s3Client, 'simple-jobs')
const lambdaClient = new AWS.Lambda({ region: 'us-west-2' })

const validate = (event) =>
    !('data' in event) ? "'data' is a required POST parameter"
        : !('limit' in event.data) ? "data.limit is a required POST parameter"
            : !('param' in event.data) ? "data.param is a required POST parameter"
                : null

export const handler = async (event, context) => {

    const job = new SimpleJobRequest({
        limit: event.data.limit,
        param: event.data.param,
    })

    const result = await persistence.read(job)

    if (!result) {
        const payload = { JobRequest: job.parameters }
        lambdaClient.invoke({ FunctionName: 'Daemon', Payload: JSON.stringify(payload) })
        return { statusCode: 202, data: { message: "Job Started" } }
    } else {
        return { statusCode: 200, data: { result } }
    }
}
