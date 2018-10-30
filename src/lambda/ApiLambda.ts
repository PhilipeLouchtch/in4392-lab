import { APIEventPayload } from '../api/types/APIEventPayload'
import { Dispatcher } from '../api/Dispatcher'
import { QueryParams } from '../api/types/QueryParams'
import S3 = require('aws-sdk/clients/s3')
import { config } from 'aws-sdk'

class ApiLambda {

    private s3Client: S3

    constructor(s3Client: S3) {
        this.s3Client = s3Client
    }

    run(event: APIEventPayload<QueryParams>, context, callback) {
        new Dispatcher(this.s3Client).dispatch(event.queryStringParameters)
            .then(r => callback(null, r))
            .catch(callback)
    }

}

export default ApiLambda
