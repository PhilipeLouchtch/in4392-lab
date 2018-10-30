import {StepOneQueue} from "../../queue/StepOneQueue";
import {StepTwoQueue} from "../../queue/StepTwoQueue";
import {RandomChance} from "../../lib/RandomChance";
import {DaemonManagedLambda} from "../DaemonManagedLambda";
import {ExecutionTime} from "../../lib/ExecutionTime";

export class ProcessStepOneLambda extends DaemonManagedLambda {
    private queueIsEmpty: boolean;

    constructor(executionTime: ExecutionTime,
                private readonly stepOneQueue: StepOneQueue,
                private readonly stepTwoQueue: StepTwoQueue,
                private readonly chance: RandomChance) {
        super(executionTime);
        this.queueIsEmpty = false;
    }

    async run() {
        let queueWasEmpty = false;
        let emptyQueueHandler = () => new Promise(() => this.queueIsEmpty = true).then(() => {})

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

    async implementation(): Promise<void> {
        return this.run();
    }

    protected continueExecution(): boolean {
        // continue if we're not aware of queue being empty yet
        return this.queueIsEmpty == false;
    }
}