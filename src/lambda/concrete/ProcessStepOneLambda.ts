import {StepOneQueue} from "../../queue/StepOneQueue";
import {StepTwoQueue} from "../../queue/StepTwoQueue";
import {RandomChance} from "../../lib/RandomChance";

export class ProcessStepOneLambda {

    constructor(private readonly stepOneQueue: StepOneQueue,
                private readonly stepTwoQueue: StepTwoQueue,
                private readonly chance: RandomChance) {
    }

    async run() {
        return this.stepOneQueue.receive(this.processMsg)
            .then(() => this.run()); // loop?
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