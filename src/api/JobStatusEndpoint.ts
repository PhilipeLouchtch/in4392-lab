import { JobStatusQuery } from './types/queries/JobStatusQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint';
import S3 = require('aws-sdk/clients/s3')

export class JobStatusEndpoint  implements APIEndpoint<JobStatusQuery> {

    private s3Client: S3

    constructor(s3Client: S3){
        this.s3Client = s3Client
    }

    public async handle(query: JobStatusQuery): Promise<Response> {
        return { statusCode: 203, body: JSON.stringify({ jobId: "abc" }) }
    }

}
