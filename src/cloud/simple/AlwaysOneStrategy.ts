import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { SimpleCloud } from './SimpleCloud'

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class AlwaysOneStrategy implements SchedulingStrategy<SimpleCloud> {

    async schedule(cloud: SimpleCloud): Promise<void> {
        cloud.feedLambda.setGoal(1)
        cloud.stepOneLambda.setGoal(1)
        cloud.reduceLambda.setGoal(1)
    }

}
