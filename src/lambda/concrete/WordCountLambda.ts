import { DaemonManagedLambda } from "../DaemonManagedLambda";
import { Queue } from "../../queue/Queue";
import { Message } from "../../source/Message";
import { ExecutionTime } from "../../lib/ExecutionTime";
import { WordCountOperation } from '../../operation/WordCountOperation';

export class WordCountLambda extends DaemonManagedLambda {

    private wordCountOperation: WordCountOperation;
    private queueIsEmpty: boolean;
    private done: boolean = false;

    constructor(executionTime: ExecutionTime,
        private readonly inputQueue: Queue<Message<string, string>>,
        private readonly outputQueue: Queue<Message<string, string>>) {
        super(executionTime);

        this.wordCountOperation = new WordCountOperation();
        this.queueIsEmpty = false;
    }

    protected continueExecution(): boolean {
        return !this.done;
    }

    protected async implementation(): Promise<void> {
        return this.inputQueue.receive(msg => {
            let wordCountOfMsg = this.wordCountOperation.count(msg).toString();
            console.log(`WordCountLambda: processing msg ${msg}, counted words: ${wordCountOfMsg}`);
            return this.outputQueue.sendSingle({ identifier: "", data: wordCountOfMsg })
                .catch((e) => this.handleReject(e))
        }, () => {
            this.queueIsEmpty = true;
            console.log(`WordCountLambda: encountered empty queue, allowing self to be terminated`);
            return Promise.resolve()
        }).catch((e) => this.handleReject(e)); // Done when queue is gone
    }

    protected handleReject(e) {
        if (e.code === "AWS.SimpleQueueService.NonExistentQueue") {
            console.log("Queue is gone, assuming done.")
            this.done = true
        }
    }
}