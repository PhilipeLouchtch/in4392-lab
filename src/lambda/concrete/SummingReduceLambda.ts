import {Queue} from "../../queue/Queue";
import {Message} from "../../source/Message";
import {AdditionReduceOperation} from "../../operation/AdditionReduceOperation";
import {StatelessReduceLambda} from "./StatelessReduceLambda";

export class SummingReduceLambda extends StatelessReduceLambda<string> {
    constructor(queue: Queue<Message<string, string>>) {
        const reduceOperation = new AdditionReduceOperation(value => Number(value));
        super(queue, reduceOperation);
    }
}