import {DaemonManagedLambda} from "../DaemonManagedLambda";
import {Queue} from "../../queue/Queue";
import {Message} from "../../source/Message";
import {ExecutionTime} from "../../lib/ExecutionTime";
import { WordCountOperation } from '../../operation/WordCountOperation';

export class WordCountLambda extends DaemonManagedLambda {

    private wordCountOperation: WordCountOperation;
    private queueIsEmpty: boolean;

    constructor(executionTime: ExecutionTime,
                private readonly inputQueue: Queue<Message<string,string>>,
                private readonly outputQueue: Queue<Message<string,string>>) {
        super(executionTime);

        this.wordCountOperation = new WordCountOperation();
        this.queueIsEmpty = false;
    }

    protected continueExecution(): boolean {
        return true;
    }

    protected async implementation(): Promise<void> {
        return this.inputQueue.receive(msg => {
                let wordCountOfMsg = this.wordCountOperation.count(msg).toString();
                console.log(`WordCountLambda: processing msg ${msg}, counted words: ${wordCountOfMsg}`);
                return this.outputQueue.sendSingle({identifier: "", data: wordCountOfMsg})
            },() => {
                this.queueIsEmpty = true;
                console.log(`WordCountLambda: encountered empty queue, allowing self to be terminated`);
                return Promise.resolve()
        });
    }
}