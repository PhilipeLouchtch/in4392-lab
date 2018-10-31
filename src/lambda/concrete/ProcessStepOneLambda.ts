import {StepOneQueue} from "../../queue/StepOneQueue";
import {StepTwoQueue} from "../../queue/StepTwoQueue";
import {RandomChance} from "../../lib/RandomChance";
import {DaemonManagedLambda} from "../DaemonManagedLambda";
import {ExecutionTime} from "../../lib/ExecutionTime";
import uuidv4 = require("uuid/v4")

export class ProcessStepOneLambda extends DaemonManagedLambda {
    private queueIsEmpty: boolean;

    constructor(executionTime: ExecutionTime,
                private readonly stepOneQueue: StepOneQueue,
                private readonly stepTwoQueue: StepTwoQueue,
                private readonly chance: RandomChance) {
        super(executionTime);
        this.queueIsEmpty = false;
    }

    async implementation() {
        let emptyQueueHandler = () => new Promise(() => this.queueIsEmpty = true)
            .then(() => {});

        return this.stepOneQueue.receive(this.processMsg.bind(this), emptyQueueHandler);
    }

    private async processMsg(data: string) {
        console.log("Processing message:" ,data) 
        // pretend to be a filter operation, allow random msgs to pass
        if (this.chance.ofPercent(80)) {
            const id = uuidv4()
            console.log("Passed filter with id ", id)
            // naive, single-msg implementation. If optimization needed,
            // can rewrite into a Source implementation for batching
            return this.stepTwoQueue.sendSingle({identifier: id, data: data});
        }

        return Promise.resolve();
    }

    protected continueExecution(): boolean {
        // continue if we're not aware of queue being empty yet
        return this.queueIsEmpty == false;
    }
}