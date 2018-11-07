import { ReduceOperation } from "../../operation/ReduceOperation";
import { Queue } from "../../queue/Queue";
import { Message } from "../../source/Message";
import { DaemonManagedLambda } from "../DaemonManagedLambda";
import { ExecutionTime, MomentBasedExecutionTime } from "../../lib/ExecutionTime";
import { MilliSecondBasedTimeDuration, TimeUnit } from "../../lib/TimeDuration";
import { JobRequest } from '../../job/JobRequest';
import { Persistence } from '../../persistence/Persistence';
import { JobResult } from '../../job/JobResult';

// Warning: this lambda does not scale!
export class StatelessReduceLambda<P, T> extends DaemonManagedLambda {
    private probablyDone: boolean;

    constructor(executionTime: ExecutionTime,
                private readonly queue: Queue<Message<string, T>>,
                private readonly reduceOperation: ReduceOperation<T>,
                private readonly job: JobRequest<P>,
                private readonly persist: Persistence<JobResult<T>>) {
        super(executionTime);
        this.probablyDone = false;
    }

    async implementation() {
        // todo: fix when only one msg
        console.log(`StatelessReduceLambda: fetching message`);
        return this.queue.receive(msgOne => {
                console.log(`StatelessReduceLambda: received msg 1: ${msgOne}`);
                return this.queue.receive(msgTwo => {
                        console.log(`StatelessReduceLambda: received msg 2: ${msgTwo}`);
                        const reduced = this.reduceOperation.reduce(msgOne, msgTwo);
                        return this.queue.sendSingle({ identifier: "", data: reduced });
                    },
                    async () => {
                        // only one message was in queue -> done
                        console.log(`final result: ${msgOne}`);

                        const jobStatus = await this.persist.read(this.job);

                        if (!jobStatus) {
                            const error = Error("Job completed but job status doesn't exist");
                            console.error(error);
                            throw error;
                        }

                        const jobStatusCompleted = jobStatus.completed(msgOne);
                        this.probablyDone = true;

                        return this.persist.store(this.job, jobStatusCompleted);
                    });
            },
            () => {
                // Queue totally empty, do nothing
                return Promise.resolve();
            });
    }

    protected continueExecution(): boolean {
        return !this.probablyDone;
    }
}