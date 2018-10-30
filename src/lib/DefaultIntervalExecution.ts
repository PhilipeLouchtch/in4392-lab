import { IntervalExecution } from './IntervalExecution'

/** Uses Vanilla JS .setInterval() method */
export class DefaultIntervalExecution implements IntervalExecution {
    private intervalHandle: any

    constructor(handle: number) {
        this.intervalHandle = handle
    }

    stop() {
        clearInterval(this.intervalHandle)
    }
}
