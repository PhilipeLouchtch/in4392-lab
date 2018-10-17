import {StepOneQueue} from "../queue/StepOneQueue";
import {StepTwoQueue} from "../queue/StepTwoQueue";

export class ProcessStepOneLambda {
    private stepOneQueue: StepOneQueue;
    private stepTwoQueue: StepTwoQueue;

    constructor(stepOneQueue: StepOneQueue, stepTwoQueue: StepTwoQueue) {
        this.stepOneQueue = stepOneQueue;
        this.stepTwoQueue = stepTwoQueue;
    }

    async run() {
        return this.stepOneQueue.receive(this.processMsg)
            .then(() => this.run()); // loop?
    }

    private async processMsg(data: string) {
        // pretend to be a filter operation, allow random msgs to pass
        if (Math.random() % 2 == 1) {
            // naive, single-msg implementation. If optimization needed,
            // can rewrite into a Source implementation for batching
            return this.stepTwoQueue.sendSingle({identifier: "", data: data});
        }

        return Promise.resolve();
    }
}