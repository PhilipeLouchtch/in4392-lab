import {Queue} from "../queue/Queue";
import {Message} from "../source/Message";
import {AdditionReduceOperation} from "../operation/AdditionReduceOperation";

export class SummingReduceLambda {
    private reduceOperation: AdditionReduceOperation;

    constructor(private readonly queue: Queue<Message<string, string>>) {
        this.reduceOperation = new AdditionReduceOperation(string => Number(string));
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