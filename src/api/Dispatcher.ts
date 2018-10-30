import { QueryParams } from './types/QueryParams'
import { CreateJobEndpoint } from './CreateJobEndpoint'
import { JobStatusEndpoint } from './JobStatusEndpoint'
import { JobDataEndpoint } from './JobDataEndpoint'
import { Endpoints } from './types/Endpoints'
import { Response } from './types/Response'
import S3 = require('aws-sdk/clients/s3')

export class Dispatcher {

    private s3Client: S3

    constructor(s3Client: S3){
        this.s3Client = s3Client
    }

    public dispatch(query: QueryParams): Promise<Response> {
        switch (query.endpoint) {
            case Endpoints.CreateJob: return new CreateJobEndpoint(this.s3Client).handle(query)
            case Endpoints.JobStatus: return new JobStatusEndpoint(this.s3Client).handle(query)
            case Endpoints.JobData: return new JobDataEndpoint(this.s3Client).handle(query)
            default: return Promise.reject("Endpoint Unknown")
        }
    }

}
