import {Source} from "./Source";
import {Message} from "./Message";

export class SimpleSource implements Source<Message<string, string>> {
    private seqNum;
    private templateString: string;

    constructor(templateString: string) {
        this.templateString = templateString;
        this.seqNum = 0;
    }

    provideContent(): Message<string, string> {
        const seqNum = this.sequenceNumber();

        return {identifier: seqNum.toString(), data: `${this.templateString} ${seqNum}`};
    }

    next(): IteratorResult<Message<string, string>> {
        return {done: false, value: this.provideContent()};
    }

    private sequenceNumber(): number {
        return this.seqNum++;
    }
}
