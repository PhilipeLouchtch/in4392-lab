import {Source} from "../source/Source";
import {JobRequest} from "../JobRequest";
import {Message} from "../source/Message";
import {StepOneQueue} from "../queue/StepOneQueue";

// @ts-ignore
export class FeedLambda {
    private queue: StepOneQueue;
    private source: Source<Message<string, string>>;
    private job: JobRequest;

    constructor(queue: StepOneQueue, source: Source<Message<string, string>>, job: JobRequest) {
        this.queue = queue;
        this.source = source;
        this.job = job;
    }

    async run() {
        let dataLimit = this.job.limit;

        // TODO: can't the TS compiler infer the type somehow?
        const promises: Promise<void>[] = [];

        for (let i = 0; i < dataLimit; i += 10) {
            // TODO: check for race conditions wrt the source
            promises.push(this.queue.sendBatched(this.source));
        }

        return Promise.all(promises);
    }
}

export default FeedLambda
