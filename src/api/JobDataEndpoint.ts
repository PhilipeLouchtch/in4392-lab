import { JobDataQuery } from './types/queries/JobDataQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint';

export class JobDataEndpoint  implements APIEndpoint<JobDataQuery> {

    public async handle(query: JobDataQuery): Promise<Response> {
        return { statusCode: 203, body: JSON.stringify({ jobId: "xyz" }) }
    }

}
