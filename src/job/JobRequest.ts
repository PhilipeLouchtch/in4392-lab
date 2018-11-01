import { Keyable } from "../lib/Keyable";
import { JobStatus } from './JobStatus';
import crypto = require("crypto");

/** Since we are not storing the class object but its data */
export interface JobRequestDict<P, T> {
    parameters: P,
    status: JobStatus,
}

export class JobRequest<P> implements Keyable {

    /**
     * 
     * @param parameters The parameters uniquely identify a request.
     */
    constructor(readonly parameters: P) { }

    asKey(): string {
        let hash = crypto.createHash("sha256");
        let digest = hash.update(JSON.stringify(this.parameters)).digest("base64");
        return digest;
    }

}
