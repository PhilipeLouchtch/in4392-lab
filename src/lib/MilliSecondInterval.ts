import { DefaultIntervalExecution } from "./DefaultIntervalExecution"

export class MilliSecondInterval {
    private milliSeconds: number

    constructor(milliSeconds: number) {
        this.milliSeconds = milliSeconds
    }

    onEvery(fn: Function) {
        return new DefaultIntervalExecution(setInterval(fn, this.milliSeconds))
    }
}
