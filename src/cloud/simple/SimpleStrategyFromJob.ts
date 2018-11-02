import { SchedulingStrategy } from '../scheduling/SchedulingStrategy';
import { SimpleJobRequest } from '../../job/SimpleJobRequest';
import { AlwaysOneStrategy } from './AlwaysOneStrategy';
import { StaticProportionalStrategy } from './StaticProportionalStrategy';
import { SimpleCloud } from './SimpleCloud';

export class SimpleStrategyFromJob implements SchedulingStrategy<SimpleCloud> {

    private readonly strategy: SchedulingStrategy<SimpleCloud>;

    constructor(job: SimpleJobRequest) {
        this.strategy = this.parseJob(job)
    }

    private parseJob(job: SimpleJobRequest) {
        const { strategy } = job.decodeParameters()
        switch (strategy) {
            case "StaticProportional": return new StaticProportionalStrategy(job)
            case "AlwaysOne": return new AlwaysOneStrategy()
            default: return new AlwaysOneStrategy()
        }
    }

    schedule(cloud: SimpleCloud) {
        return this.strategy.schedule(cloud)
    }

}