import {Queue} from "../queue/Queue";
import {Message} from "../source/Message";
import {AdditionReduceOperation} from "../operation/AdditionReduceOperation";
import {ReduceLambda} from "./ReduceLambda";

export class SummingReduceLambda extends ReduceLambda<string> {
    constructor(queue: Queue<Message<string, string>>) {
        const reduceOperation = new AdditionReduceOperation(string => Number(string));
        super(queue, reduceOperation);
    }
}