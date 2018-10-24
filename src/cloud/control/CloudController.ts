import { Cloud } from './Cloud'
import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'

/**
 * A `CloudController` takes a `Cloud` and a `SchedulingStrategy`. 
 * It spawns the `Cloud` and reschedules at a certain interval by calling `SchedulingStrategy.schedule()`.
 */
export class CloudController<T extends Cloud> {

    private cloud: T
    private strategy: SchedulingStrategy<T>
    private intervalMs: number

    constructor(cloud: T, strategy: SchedulingStrategy<T>, intervalMs: number) {
        this.cloud = cloud
        this.strategy = strategy
        this.intervalMs = intervalMs
    }

    start(): Promise<any> {
        return this.cloud.spawn()
    }

    /** At a certain interval, adjust the schedule */
    async tick() {
        this.strategy.schedule(this.cloud)

        this.afterTick()
    }

    afterTick() {
        setTimeout(() => this.tick().then(this.afterTick), this.intervalMs)
    }

}
