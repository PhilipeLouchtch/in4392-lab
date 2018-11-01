import { ReduceOperation } from "../../operation/ReduceOperation";
import { Queue } from "../../queue/Queue";
import { Message } from "../../source/Message";
import { DaemonManagedLambda } from "../DaemonManagedLambda";
import { MomentBasedExecutionTime } from "../../lib/ExecutionTime";
import { MilliSecondBasedTimeDuration, TimeUnit } from "../../lib/TimeDuration";

// Warning: this lambda does not scale!
export class StatelessReduceLambda<T> extends DaemonManagedLambda {
    private probablyDone: boolean;

    constructor(private readonly queue: Queue<Message<string, T>>,
        private readonly reduceOperation: ReduceOperation<T>) {
        super(new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(4, TimeUnit.minutes)));
        this.probablyDone = false;
    }

    async implementation() {
        // todo: fix when only one msg
        console.log(`StatelessReduceLambda: fetching message`)
        return this.queue.receive(msgOne => {
            console.log(`StatelessReduceLambda: received msg 1: ${msgOne}`)
            return this.queue.receive(msgTwo => {
                console.log(`StatelessReduceLambda: received msg 2: ${msgTwo}`)
                const reduced = this.reduceOperation.reduce(msgOne, msgTwo);
                return this.queue.sendSingle({ identifier: "", data: reduced });
            },
                () => {
                    // only one message was in queue -> done
                    // TODO: write to persistence layer
                    console.log(`final result: ${msgOne}`);
                    this.probablyDone = true;
                    return Promise.resolve();
                })
        },
            () => {
                // Queue totally empty, do nothing
                return Promise.resolve();
            });
    }

    protected continueExecution(): boolean {
        return !this.probablyDone;
    }
}