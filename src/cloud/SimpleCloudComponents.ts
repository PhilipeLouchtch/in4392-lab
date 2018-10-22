import { LambdaController } from './control/LambdaController';
import { QueueController } from './control/QueueController';
import { FeedDeps, OneDeps, ReduceDeps } from './LambdaDependencies';

/**
 * The set of controllers for all elements in the current cloud
 */
export type SimpleCloudComponents = {
    feedLambda: LambdaController<FeedDeps>
    stepOneLambda: LambdaController<OneDeps>
    reduceLambda: LambdaController<ReduceDeps>
    stepZeroQueue: QueueController
    stepOneQueue: QueueController
    stepTwoQueue: QueueController
    stepThreeQueue: QueueController
}
