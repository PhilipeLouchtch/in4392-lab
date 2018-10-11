import {Source} from "./Source";

class SimpleSource implements Source<String> {
    private seqNum = 0;

    provideContent(): String {
        return "This is a static message (#" + this.sequenceNumber() + ")";
    }

    next(): IteratorResult<String> {
        return {done: false, value: this.provideContent()};
    }

    private sequenceNumber(): number {
        return this.seqNum++;
    }
}
