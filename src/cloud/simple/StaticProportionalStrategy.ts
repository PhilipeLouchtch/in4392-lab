import { SchedulingStrategy } from '../scheduling/SchedulingStrategy'
import { SimpleCloud } from './SimpleCloud'
import { SimpleJobRequest, SimpleJobParameters } from '../../job/SimpleJobRequest';

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class StaticProportionalStrategy implements SchedulingStrategy<SimpleCloud> {

    constructor(private  readonly job: SimpleJobRequest) { }

    async schedule(cloud: SimpleCloud): Promise<void> {
        const params: SimpleJobParameters = this.job.decodeParameters()
        const count = Math.ceil(params.messagesPerLambda ? this.job.parameters.limit / params.messagesPerLambda : 1)
        console.log(`StaticProportionalStrategy: Scheduling Lambdas to ${count}`)

        cloud.feedLambda.scaleUpUntil(1)
        cloud.reduceLambda.scaleUpUntil(1)

        cloud.stepOneLambda.scaleUpUntil(count)
        cloud.stepTwoLambda.scaleUpUntil(count)
    }

}
