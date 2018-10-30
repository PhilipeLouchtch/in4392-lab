import {ReduceOperation} from "../../operation/ReduceOperation";
import {Queue} from "../../queue/Queue";
import {Message} from "../../source/Message";
import {DaemonManagedLambda} from "../DaemonManagedLambda";
import {MomentBasedExecutionTime} from "../../lib/ExecutionTime";
import {NumericSeconds, TimeUnit} from "../../lib/Seconds";

export class StatelessReduceLambda<T> extends DaemonManagedLambda {
    constructor(private readonly queue: Queue<Message<string, T>>,
                private readonly reduceOperation: ReduceOperation<T>) {
        super(new MomentBasedExecutionTime(new NumericSeconds(4, TimeUnit.minutes)))
    }

    async implementation(): Promise<void> {
        return this.run();
    }

    async run() {
        // todo: fix when only one msg
        return this.queue.receive(msgOne => {
                return this.queue.receive(msgTwo => {
                        const reduced = this.reduceOperation.reduce(msgOne, msgTwo);
                        return this.queue.sendSingle({identifier: "", data: reduced});
                    },
                    () => {
                        // only one message was in queue -> done
                        // TODO: write to persistence layer
                        console.log(`final result: ${msgOne}`);
                        return Promise.resolve();
                    })
            },
            () => {
                // Queue totally empty, do nothing
                return Promise.resolve();
            });
    }
}