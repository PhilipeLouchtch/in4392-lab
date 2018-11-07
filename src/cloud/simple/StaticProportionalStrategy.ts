import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { SimpleCloud } from './SimpleCloud'
import { SimpleJobRequest } from '../../job/SimpleJobRequest';

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class StaticProportionalStrategy implements SchedulingStrategy<SimpleCloud> {

    constructor(private  readonly job: SimpleJobRequest, private readonly ratio: number) { }

    async schedule(cloud: SimpleCloud): Promise<void> {
        // const params: SimpleJobParameters = this.job.decodeParameters()
        const count = Math.ceil(this.job.parameters.limit / this.ratio)
        console.log(`StaticProportionalStrategy: Scheduling Lambdas to ${count}`)

        cloud.feedLambda.scaleUpUntil(1)
        cloud.reduceLambda.scaleUpUntil(count)

        cloud.stepOneLambda.scaleUpUntil(count)
        cloud.stepTwoLambda.scaleUpUntil(count)
    }

}
