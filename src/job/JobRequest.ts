import { Keyable } from "../lib/Keyable";
import crypto = require("crypto");

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
