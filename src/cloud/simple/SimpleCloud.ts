import { Lambda, SQS } from 'aws-sdk'
import { LambdaController } from '../control/LambdaController'
import { QueueController } from '../control/QueueController'
import { FeedDeps, OneDeps, ReduceDeps } from './LambdaDependencies'
import { Cloud } from '../control/Cloud'

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
    readonly reduceLambda: LambdaController<ReduceDeps>

    constructor(lambdaClient: Lambda, sqsClient: SQS, uuid: string) {
        const queueNames = ['zero', 'one', 'two', 'three'].map(n => `step_${n}_${uuid}`)
        this.stepZeroQueue = new QueueController(sqsClient, queueNames[0])
        this.stepOneQueue = new QueueController(sqsClient, queueNames[1])
        this.stepTwoQueue = new QueueController(sqsClient, queueNames[2])
        this.stepThreeQueue = new QueueController(sqsClient, queueNames[3])

        this.feedLambda = new LambdaController<FeedDeps>(lambdaClient, `feed_lambda`, { step_zero: queueNames[0], step_one: queueNames[1] })
        this.stepOneLambda = new LambdaController<OneDeps>(lambdaClient, `one_lambda`, { step_one: queueNames[1], step_two: queueNames[2] })
        this.reduceLambda = new LambdaController<ReduceDeps>(lambdaClient, `reduce_lambda`, { step_two: queueNames[2], step_three: queueNames[3] })
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
