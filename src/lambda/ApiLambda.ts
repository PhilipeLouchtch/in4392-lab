import { APIEventPayload } from '../api/types/APIEventPayload'
import { Dispatcher } from '../api/Dispatcher'
import { QueryParams } from '../api/types/QueryParams'

class ApiLambda {

    run(event: APIEventPayload<QueryParams>, context, callback) {
        new Dispatcher().dispatch(event.queryStringParameters)
            .then(r => callback(null, r))
            .catch(callback)
    }

}

export default ApiLambda
