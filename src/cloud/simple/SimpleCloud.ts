import { Lambda, SQS } from 'aws-sdk'
import { LambdaFunctionLifecycle } from '../control/LambdaFunctionLifecycle'
import { SqsQueueLifecycle } from '../control/SqsQueueLifecycle'
import { FeedDeps, OneDeps, ReduceDeps, WordCountDeps } from './LambdaDependencies'
import { Cloud } from '../control/Cloud'
import { SimpleJobRequest } from '../../job/SimpleJobRequest';
import { QueueMetrics } from "../metrics/QueueMetrics";

/**
 * The SimpleCloud.
 */
export class SimpleCloud implements Cloud {

    private readonly queues: SqsQueueLifecycle[] = [];

    readonly feedLambda: LambdaFunctionLifecycle<FeedDeps>
    readonly stepOneLambda: LambdaFunctionLifecycle<OneDeps>
    readonly stepTwoLambda: LambdaFunctionLifecycle<WordCountDeps>
    readonly reduceLambda: LambdaFunctionLifecycle<ReduceDeps>

    constructor(lambdaClient: Lambda, sqsClient: SQS, uuid: string, job: SimpleJobRequest) {
        const queues = ['zero', 'one', 'two']
            .map(value => `step_${value}_${uuid}`)
            .map(queueName => new SqsQueueLifecycle(sqsClient, queueName));
        this.queues = queues

        this.feedLambda = new LambdaFunctionLifecycle<FeedDeps>(lambdaClient, `Feed`,
            { output_queue: queues[0].queueName, JobRequest: job.parameters })

        this.stepOneLambda = new LambdaFunctionLifecycle<OneDeps>(lambdaClient, `ProcessStepOne`,
            { input_queue: queues[0].queueName, output_queue: queues[1].queueName, JobRequest: job.parameters })

        this.stepTwoLambda = new LambdaFunctionLifecycle<WordCountDeps>(lambdaClient, 'WordCount',
            { input_queue: queues[1].queueName, output_queue: queues[2].queueName, JobRequest: job.parameters })

        this.reduceLambda = new LambdaFunctionLifecycle<ReduceDeps>(lambdaClient, `SummingReduce`,
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

    queueMetrics(): QueueMetrics[] {
        return this.queues.map(value => value.getMetrics());
    }

}
