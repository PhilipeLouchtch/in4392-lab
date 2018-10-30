import {Source} from "../../source/Source";
import {JobRequest} from "../../JobRequest";
import {Message} from "../../source/Message";
import {MomentBasedExecutionTime} from "../../lib/ExecutionTime";
import {NumericSeconds, TimeUnit} from "../../lib/Seconds";
import {OneShotLambda} from "../OneShotLambda";
import {StepOneQueue} from "../../queue/StepOneQueue";

export class FeedLambda extends OneShotLambda {
    private queue: StepOneQueue;
    private source: Source<Message<string, string>>;
    private job: JobRequest;

    constructor(queue: StepOneQueue, source: Source<Message<string, string>>, job: JobRequest) {
        super(new MomentBasedExecutionTime(new NumericSeconds(4, TimeUnit.minutes)));

        this.queue = queue;
        this.source = source;
        this.job = job;
    }

    // TODO: Investigate need to turn into ImmortalLambda, if cannot drain source fast enough
    // then will have to extend source with a checkpoint save/restore functionality
    async implementation() {
        let dataLimit = this.job.limit;

        const promises: Promise<any>[] = [];

        for (let i = 0; i < dataLimit; i += 10) {
            promises.push(this.queue.sendBatched(this.source));
        }

        return Promise.all(promises)
            .then(() => {});
    }
}

export default FeedLambda
