import * as moment from "moment";
import {MilliSecondBasedTimeDuration, TimeDuration, TimeUnit} from "./TimeDuration";

export interface ExecutionTime {
    hasReachedThreshold(): boolean;
}

export class MomentBasedExecutionTime implements ExecutionTime {
    private startedOn: moment.Moment;

    constructor(private readonly threshold: TimeDuration) {
        this.startedOn = moment();
    }

    hasReachedThreshold(): boolean {
        let now = moment();
        let secondsElapsed = new MilliSecondBasedTimeDuration(now.diff(this.startedOn, "seconds"), TimeUnit.seconds);
        return secondsElapsed.greaterEqualTo(this.threshold);
    }
}