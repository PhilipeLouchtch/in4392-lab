import { CreateJobQuery } from './types/queries/CreateJobQuery'
import { Response } from './types/Response'
import { APIEndpoint } from './types/APIEndpoint';

export class CreateJobEndpoint implements APIEndpoint<CreateJobQuery> {

    public async handle(query: CreateJobQuery): Promise<Response> {
        return { statusCode: 203, body: JSON.stringify({ jobId: "jobep" }) }
    }

}
