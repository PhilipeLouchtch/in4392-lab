import { QueryParams } from './QueryParams'
import { Response } from './Response'

export interface APIEndpoint<Q extends QueryParams>{
    handle(query: Q): Promise<Response>
}
