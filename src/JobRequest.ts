export class JobRequest {
    /**
     * @param limit Max items that are to be processed as part of the job
     * @param param Some parameter, like name of the job, or keyword... something to make it "less trivial" than just a limit
     */
    constructor (readonly limit: number, readonly param: string) {
    }
}