import { SimpleCloudComponents } from './SimpleCloudComponents';

/**
 * The cloud controller monitors the performance of the current
 * cloud and schedules more workers when necessary
 */
export class SimpleCloudController {

    private cloud: SimpleCloudComponents

    constructor(cloud: SimpleCloudComponents) {
        this.cloud = cloud
    }

    start() {
        // TODO: Implement more complex control
        this.cloud.feedLambda.setGoal(1)
        this.cloud.stepOneLambda.setGoal(1)
        this.cloud.reduceLambda.setGoal(1)
    }

}
