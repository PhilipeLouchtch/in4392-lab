import { Queue } from "../../queue/Queue";
import { Message } from "../../source/Message";
import { AdditionReduceOperation } from "../../operation/AdditionReduceOperation";
import { StatelessReduceLambda } from "./StatelessReduceLambda";
import { JobRequest } from '../../job/JobRequest';
import { Persistence } from '../../persistence/Persistence';
import { JobResult } from '../../job/JobResult';

type ResultType = string
export class SummingReduceLambda<P> extends StatelessReduceLambda<P, ResultType> {
    constructor(queue: Queue<Message<string, ResultType>>, job: JobRequest<P>, persistence: Persistence<JobResult<ResultType>>) {
        const reduceOperation = new AdditionReduceOperation(value => Number(value));
        super(queue, reduceOperation, job, persistence);
    }
}