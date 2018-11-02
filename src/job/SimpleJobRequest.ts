import { JobRequest } from './JobRequest';

const crypto = require("crypto");

export type SimpleJobResult = string

export interface SimpleJobParams {
    /** Max items that are to be processed as part of the job */
    readonly limit: number,
    /** Some parameter, like name of the job, or keyword... something to make it "less trivial" than just a limit */
    readonly param: string,
}

export class SimpleJobRequest extends JobRequest<SimpleJobParams> {

    asKey(): string {
        let hash = crypto.createHash("sha256");
        // Remove non-alpha chars so we can use this key safely in urls and names
        let digest = hash.update(this.parameters.limit.toString()).update(this.parameters.param).digest("base64").replace(/[\W_]+/g,"");
        return digest;
    }

}
