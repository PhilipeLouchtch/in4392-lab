import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { SimpleCloud } from './SimpleCloud'

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class AlwaysOneStrategy implements SchedulingStrategy<SimpleCloud> {

    async schedule(cloud: SimpleCloud): Promise<void> {
        cloud.feedLambda.scaleUpUntil(1)
        cloud.stepOneLambda.scaleUpUntil(1)
        cloud.reduceLambda.scaleUpUntil(1)
    }

}
