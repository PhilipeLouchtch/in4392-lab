import { QueryParams } from './types/QueryParams'
import { CreateJobEndpoint } from './CreateJobEndpoint'
import { JobStatusEndpoint } from './JobStatusEndpoint'
import { JobDataEndpoint } from './JobDataEndpoint'
import { Endpoints } from './types/Endpoints'
import { Response } from './types/Response'

export class Dispatcher {

    public dispatch(query: QueryParams): Promise<Response> {
        switch (query.endpoint) {
            case Endpoints.CreateJob: return new CreateJobEndpoint().handle(query)
            case Endpoints.JobStatus: return new JobStatusEndpoint().handle(query)
            case Endpoints.JobData: return new JobDataEndpoint().handle(query)
            default: return Promise.reject("Endpoint Unknown")
        }
    }

}
