import { TimeDuration } from "./TimeDuration";
import { ExecutionTime } from './ExecutionTime';

// Lack of AWS interface
export interface Context {
    getRemainingTimeInMillis(): number
}

export class ContextBasedExecutionTime implements ExecutionTime {

    constructor(private readonly context: Context, private margin: TimeDuration) { }

    hasReachedThreshold(): boolean {
        return this.context.getRemainingTimeInMillis() <= this.margin.toMilliSeconds()
    }
}