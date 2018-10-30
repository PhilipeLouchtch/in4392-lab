import { CreateJobQuery } from './types/queries/CreateJobQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint'
import { S3Persistence } from '../persistence/S3Persistence'
import S3 = require('aws-sdk/clients/s3')
import { JobStatus } from '../job/JobStatus';
import { JobData } from '../job/JobData';
const uuidv4 = require('uuid/v4')

export class CreateJobEndpoint implements APIEndpoint<CreateJobQuery> {

    private s3Client: S3

    constructor(s3Client: S3) {
        this.s3Client = s3Client
    }

    public async handle(query: CreateJobQuery): Promise<Response> {
        try {
            const store = new S3Persistence(this.s3Client, 'simple-jobs')
            const id = uuidv4()
            const job: JobData<any> = { id, status: JobStatus.RUNNING }
            await store.store({ asKey: () => id }, job)
            return { statusCode: 203, body: JSON.stringify({ job }) }
        } catch (e) {
            return { statusCode: 500, body: JSON.stringify({ error: e }) }
        }
    }

}
