import {Source} from "./Source";
import {Message} from "./Message";

class SimpleSource implements Source<Message<string, string>> {
    private seqNum;

    constructor() {
        this.seqNum = 0;
    }

    provideContent(): Message<string, string> {
        const seqNum = this.sequenceNumber();

        return {identifier: seqNum.toString(), data: `This is message #$seqNum`};
    }

    next(): IteratorResult<Message<string, string>> {
        return {done: false, value: this.provideContent()};
    }

    private sequenceNumber(): number {
        return this.seqNum++;
    }
}
