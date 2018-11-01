import { Lambda, SQS } from 'aws-sdk'
import { LambdaController } from '../control/LambdaController'
import { QueueController } from '../control/QueueController'
import {FeedDeps, OneDeps, ReduceDeps, WordCountDeps} from './LambdaDependencies'
import { Cloud } from '../control/Cloud'
import { SimpleJobRequest } from '../../job/SimpleJobRequest';

/**
 * The SimpleCloud.
 */
export class SimpleCloud implements Cloud {

    readonly stepZeroQueue: QueueController
    readonly stepOneQueue: QueueController
    readonly stepTwoQueue: QueueController
    readonly stepThreeQueue: QueueController

    readonly feedLambda: LambdaController<FeedDeps>
    readonly stepOneLambda: LambdaController<OneDeps>
    readonly stepTwoLambda: LambdaController<WordCountDeps>
    readonly reduceLambda: LambdaController<ReduceDeps>

    constructor(lambdaClient: Lambda, sqsClient: SQS, uuid: string, job: SimpleJobRequest) {
        const queueNames = ['zero', 'one', 'two', 'three'].map(n => `step_${n}_${uuid}`)
        this.stepZeroQueue = new QueueController(sqsClient, queueNames[0])
        this.stepOneQueue = new QueueController(sqsClient, queueNames[1])
        this.stepTwoQueue = new QueueController(sqsClient, queueNames[2])
        this.stepThreeQueue = new QueueController(sqsClient, queueNames[3])

        this.feedLambda = new LambdaController<FeedDeps>(lambdaClient, `Feed`, { step_one: queueNames[0], JobRequest: job.parameters })
        this.stepOneLambda = new LambdaController<OneDeps>(lambdaClient, `ProcessStepOne`, { step_one: queueNames[1], step_two: queueNames[2], JobRequest: job.parameters })
        this.stepTwoLambda = new LambdaController<WordCountDeps>(lambdaClient, 'WordCount', { input_queue: queueNames[2], output_queue: queueNames[3], JobRequest: job.parameters })
        this.reduceLambda = new LambdaController<ReduceDeps>(lambdaClient, `SummingReduce`, { input_queue: queueNames[3], JobRequest: job.parameters })
    }

    /**
     * Create all queues and report when done
     */
    public spawn(): Promise<any> {
        return Promise.all([
            this.stepZeroQueue.spawn(),
            this.stepOneQueue.spawn(),
            this.stepTwoQueue.spawn(),
            this.stepThreeQueue.spawn(),
        ])
    }

    public async terminate(): Promise<boolean> {
        return false // TBD
    }

}
