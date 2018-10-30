import { JobStatusQuery } from './types/queries/JobStatusQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint';

export class JobStatusEndpoint  implements APIEndpoint<JobStatusQuery> {

    public async handle(query: JobStatusQuery): Promise<Response> {
        return { statusCode: 203, body: JSON.stringify({ jobId: "abc" }) }
    }

}
