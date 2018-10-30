import { APIRequestPayload } from '../lib/APIRequestPayload';

class ApiLambda {
    constructor() {

    }

    run(event: APIRequestPayload, context, callback) {
        switch(event.path) {
            case '/a':
                return callback(null, { body: JSON.stringify({ x: 'A' }) })
            case '/b':
                return callback(null, { body: JSON.stringify({ x: 'B' }) })
        }
    }
}

export default ApiLambda
