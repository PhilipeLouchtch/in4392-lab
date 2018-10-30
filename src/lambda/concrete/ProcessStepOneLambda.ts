import {StepOneQueue} from "../../queue/StepOneQueue";
import {StepTwoQueue} from "../../queue/StepTwoQueue";
import {RandomChance} from "../../lib/RandomChance";

export class ProcessStepOneLambda {

    constructor(private readonly stepOneQueue: StepOneQueue,
                private readonly stepTwoQueue: StepTwoQueue,
                private readonly chance: RandomChance) {
    }

    async run() {
        let queueWasEmpty = false;
        let emptyQueueHandler = () => new Promise(() => queueWasEmpty = true).then(() => {})

        const receivePromise = this.stepOneQueue.receive(this.processMsg, emptyQueueHandler);

        if (queueWasEmpty) {
            return Promise.resolve();
        }

        return receivePromise.then(() => this.run());
    }

    private async processMsg(data: string) {
        // pretend to be a filter operation, allow random msgs to pass
        if (this.chance.ofPercent(50)) {
            // naive, single-msg implementation. If optimization needed,
            // can rewrite into a Source implementation for batching
            return this.stepTwoQueue.sendSingle({identifier: "", data: data});
        }

        return Promise.resolve();
    }
}