import {Keyable} from "./lib/Keyable";

const crypto = require("crypto");

export class JobRequest implements Keyable {
    /**
     * @param limit Max items that are to be processed as part of the job
     * @param param Some parameter, like name of the job, or keyword... something to make it "less trivial" than just a limit
     */
    constructor (readonly limit: number, readonly param: string) {
    }

    asKey(): string {
        let hash = crypto.createHash("sha256");
        let digest = hash.update(this.limit).update(this.param).digest("base64");
        return digest;
    }
}