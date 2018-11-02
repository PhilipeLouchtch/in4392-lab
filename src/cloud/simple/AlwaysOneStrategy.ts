import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { SimpleCloud } from './SimpleCloud'

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class AlwaysOneStrategy implements SchedulingStrategy<SimpleCloud> {

    async schedule(cloud: SimpleCloud): Promise<void> {
        console.log(`AlwaysOneStrategy: Scheduling Lambdas to 1`)
        cloud.feedLambda.scaleUpUntil(1)
        cloud.stepOneLambda.scaleUpUntil(1)
        cloud.stepTwoLambda.scaleUpUntil(1)
        cloud.reduceLambda.scaleUpUntil(1)
    }

}
