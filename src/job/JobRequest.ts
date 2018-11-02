import { Keyable } from "../lib/Keyable";
import crypto = require("crypto");
import { ValidationRules, type, required } from '../lib/ObjectValidator';

export interface JobParameters {
    /** Max items that are to be processed as part of the job */
    readonly limit: number,
    /** Some parameter, like name of the job, or keyword... something to make it "less trivial" than just a limit */
    readonly param: string,
}

export const jobParametersValidationRules: ValidationRules<JobParameters> = {
    limit: [required(), type('number')],
    param: [required(), type('string')],
}

export abstract class JobRequest<P> implements Keyable {

    /**
     * 
     * @param parameters The parameters uniquely identify a request.
     */
    constructor(readonly parameters: JobParameters) { }

    abstract decodeParameters(): P 

    asKey(): string {
        let hash = crypto.createHash("sha256");
        // Remove non-alpha chars so we can use this key safely in urls and names
        let digest = hash.update(this.parameters.limit.toString()).update(this.parameters.param).digest("base64").replace(/[\W_]+/g,"");
        return digest;
    }

}
