import { DefaultIntervalExecution } from "./DefaultIntervalExecution"
import {TimeDuration} from "./TimeDuration";

export class TimeBasedInterval {
    private duration: TimeDuration

    constructor(duration: TimeDuration) {
        this.duration = duration
    }

    onEvery(fn: Function) {
        return new DefaultIntervalExecution(setInterval(fn, this.duration.toMilliSeconds()))
    }
}
