import {Delay} from "./Delay";
import {TimeDuration} from "./TimeDuration";

export class TimeDurationDelay implements Delay {
    constructor(private readonly duration: TimeDuration) {
    }

    delay(): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, this.duration.toMilliSeconds()));
    }
}