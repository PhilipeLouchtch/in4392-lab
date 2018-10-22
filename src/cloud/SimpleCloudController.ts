import { SimpleCloudComponents } from './SimpleCloudComponents'
import { PerformanceMonitor } from './monitoring/PerformanceMonitor'
import { SnapshotDict } from './monitoring/SnapshotDict'
import { Schedule } from './scheduling/Schedule'
import { Policy } from './scheduling/Policy'

/**
 * The cloud controller monitors the performance of the current
 * cloud and schedules more workers when necessary
 */
export class SimpleCloudController {

    private cloud: SimpleCloudComponents
    private policy: Policy
    private monitor: PerformanceMonitor
    private intervalMs: number

    constructor(cloud: SimpleCloudComponents, scheduler: Policy, monitor: PerformanceMonitor, intervalMs: number) {
        this.cloud = cloud
        this.policy = scheduler
        this.monitor = monitor
        this.intervalMs = intervalMs
    }

    start() {
        this.cloud.feedLambda.setGoal(1)
        this.cloud.stepOneLambda.setGoal(1)
        this.cloud.reduceLambda.setGoal(1)

        this.afterTick()
    }

    /** At a certain interval, adjust the schedule */
    async tick() {
        // Make a snapshot of the cloud's performance
        const snap: SnapshotDict = await this.monitor.snapshot()

        // Create a schedule based on the performance
        const schedule: Schedule = this.policy.schedule(snap)

        // Adjust the lambdas
        this.applySchedule(schedule)
    }

    afterTick() {
        setTimeout(() => this.tick().then(this.afterTick), this.intervalMs)
    }

    applySchedule(schedule: Schedule) {
        this.cloud.feedLambda.setGoal(schedule.feedLambda)
        this.cloud.stepOneLambda.setGoal(schedule.stepOneLambda)
        this.cloud.reduceLambda.setGoal(schedule.reduceLambda)
    }

}
