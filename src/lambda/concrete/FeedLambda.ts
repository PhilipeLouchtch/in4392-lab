import {Source} from "../../source/Source";
import {JobRequest} from "../../job/JobRequest";
import {Message} from "../../source/Message";
import {MomentBasedExecutionTime} from "../../lib/ExecutionTime";
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../lib/TimeDuration";
import {OneShotLambda} from "../OneShotLambda";
import {StepOneQueue} from "../../queue/StepOneQueue";
import { SimpleJobRequest } from '../../job/SimpleJobRequest';

export class FeedLambda extends OneShotLambda {
    private queue: StepOneQueue;
    private source: Source<Message<string, string>>;
    private job: SimpleJobRequest;

    private isFirstRun: boolean;

    constructor(queue: StepOneQueue, source: Source<Message<string, string>>, job: SimpleJobRequest) {
        super(new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(4, TimeUnit.minutes)));

        this.queue = queue;
        this.source = source;
        this.job = job;

        this.isFirstRun = true;
    }

    // TODO: Investigate need to turn into ImmortalLambda, if cannot drain source fast enough
    // then will have to extend source with a checkpoint save/restore functionality
    async implementation() {
        this.isFirstRun = false;
        let dataLimit = this.job.parameters.limit;

        const promises: Promise<any>[] = [];

        for (let i = 0; i < dataLimit; i += 10) {
            promises.push(this.queue.sendBatched(this.source));
        }

        console.log(`FeedLambda: sending ${promises.length} batches..`)

        return Promise.all(promises)
            .then(() => {});
    }

    protected continueExecution(): boolean {
        return this.isFirstRun;
    }
}

export default FeedLambda
