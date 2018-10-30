import { JobDataQuery } from './types/queries/JobDataQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint';
import { S3Persistence } from '../persistence/S3Persistence';
import S3 = require('aws-sdk/clients/s3')

export class JobDataEndpoint implements APIEndpoint<JobDataQuery> {

    private s3Client: S3

    constructor(s3Client: S3) {
        this.s3Client = s3Client
    }

    public async handle(query: JobDataQuery): Promise<Response> {
        try {
            const store = new S3Persistence(this.s3Client, 'simple-jobs')
            const job = await store.read({ asKey: () => query.jobId })
            return { statusCode: 203, body: JSON.stringify({ job }) }
        } catch (e) {
            return { statusCode: 500, body: JSON.stringify({ error: e }) }
        }
    }

}
