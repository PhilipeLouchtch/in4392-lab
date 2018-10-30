import { Cloud } from '../control/Cloud'

/**
 * A `SchedulingStrategy` is specific to a particular `Cloud` implementation. 
 * It may request metrics by `.getMetrics()` upon each of the components and
 * schedule the workers by calling `LambdaController.setGoal(number)`.
 */
export interface SchedulingStrategy<T extends Cloud> {

    schedule(cloud: T): Promise<any>

}
