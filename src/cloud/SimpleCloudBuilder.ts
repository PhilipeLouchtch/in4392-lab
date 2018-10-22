import { Lambda, SQS } from 'aws-sdk';
import { LambdaController } from './control/LambdaController';
import { QueueController } from './control/QueueController';
import { FeedDeps, OneDeps, ReduceDeps } from './LambdaDependencies';
import { SimpleCloudComponents } from './SimpleCloudComponents';

/**
 * Initialize the queues and lambda controllers for the cloud
 */
export class SimpleCloudBuilder {

    private lambdaClient: Lambda
    private sqsClient: SQS

    constructor(lambdaClient: Lambda, sqsClient: SQS) {
        this.lambdaClient = lambdaClient
        this.sqsClient = sqsClient
    }

    public async createCloud(uuid: string): Promise<SimpleCloudComponents> {
        const stepZeroQueue = new QueueController(this.sqsClient, `step_zero_${uuid}`)
        const stepOneQueue = new QueueController(this.sqsClient, `step_one_${uuid}`)
        const stepTwoQueue = new QueueController(this.sqsClient, `step_two_${uuid}`)
        const stepThreeQueue = new QueueController(this.sqsClient, `step_three_${uuid}`)
        const qurls = await Promise.all([stepZeroQueue, stepOneQueue, stepTwoQueue, stepThreeQueue].map(q => q.create()))

        const feedLambda = new LambdaController<FeedDeps>(this.lambdaClient, `feed_lambda`, { step_zero: qurls[0], step_one: qurls[1] })
        const stepOneLambda = new LambdaController<OneDeps>(this.lambdaClient, `one_lambda`, { step_two: qurls[2], step_one: qurls[1] })
        const reduceLambda = new LambdaController<ReduceDeps>(this.lambdaClient, `reduce_lambda`, { step_three: qurls[3], step_two: qurls[2] })

        return { stepZeroQueue, stepOneQueue, stepTwoQueue, stepThreeQueue, feedLambda, stepOneLambda, reduceLambda }
    }

}
