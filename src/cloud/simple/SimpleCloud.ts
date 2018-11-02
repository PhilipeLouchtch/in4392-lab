import { Lambda, SQS } from 'aws-sdk'
import { LambdaController } from '../control/LambdaController'
import { SqsQueueLifecycle } from '../control/SqsQueueLifecycle'
import {FeedDeps, OneDeps, ReduceDeps, WordCountDeps} from './LambdaDependencies'
import { Cloud } from '../control/Cloud'
import { SimpleJobRequest } from '../../job/SimpleJobRequest';

/**
 * The SimpleCloud.
 */
export class SimpleCloud implements Cloud {

    readonly queues: SqsQueueLifecycle[] = [];

    readonly feedLambda: LambdaController<FeedDeps>
    readonly stepOneLambda: LambdaController<OneDeps>
    readonly stepTwoLambda: LambdaController<WordCountDeps>
    readonly reduceLambda: LambdaController<ReduceDeps>

    constructor(lambdaClient: Lambda, sqsClient: SQS, uuid: string, job: SimpleJobRequest) {
        const queues = ['zero', 'one', 'two']
            .map(value => `step_${value}_${uuid}`)
            .map(queueName => new SqsQueueLifecycle(sqsClient, queueName));
        this.queues = queues

        this.feedLambda = new LambdaController<FeedDeps>(lambdaClient, `Feed`,
            { output_queue: queues[0].queueName, JobRequest: job.parameters })

        this.stepOneLambda = new LambdaController<OneDeps>(lambdaClient, `ProcessStepOne`,
            { input_queue: queues[0].queueName, output_queue: queues[1].queueName, JobRequest: job.parameters })

        this.stepTwoLambda = new LambdaController<WordCountDeps>(lambdaClient, 'WordCount',
            { input_queue: queues[1].queueName, output_queue: queues[2].queueName, JobRequest: job.parameters })

        this.reduceLambda = new LambdaController<ReduceDeps>(lambdaClient, `SummingReduce`,
            { in_out_queue: queues[2].queueName, JobRequest: job.parameters })
    }

    /**
     * Create all queues and report when done
     */
    public spawn(): Promise<any> {
        return Promise.all(
            this.queues.map(queue => queue.spawn())
        )
    }

    public async terminate(): Promise<any> {
        console.log("SimpleCloud: terminating hasta la vista baby I'll be back..")
        return Promise.all(
            this.queues.map(queue => queue.teardown())
        )
    }

}
