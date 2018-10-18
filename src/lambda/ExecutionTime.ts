import * as moment from "moment";
import {NumericSeconds, Seconds, TimeUnit} from "./Seconds";

export interface ExecutionTime {
    hasReachedThreshold(): boolean;
}

export class MomentBasedExecutionTime implements ExecutionTime {
    private startedOn: moment.Moment;

    constructor(private readonly threshold: Seconds) {
        this.startedOn = moment();
    }

    hasReachedThreshold(): boolean {
        let now = moment();
        let secondsElapsed = new NumericSeconds(now.diff(this.startedOn, "seconds"), TimeUnit.seconds);
        return secondsElapsed.greaterEqualTo(this.threshold);
    }
}