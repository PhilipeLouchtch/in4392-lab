import { IntervalExecution } from './IntervalExecution';

/** Run a given function at an interval and provide a stoppable execution handle */
export interface Interval {
    onEvery(fn: Function): IntervalExecution
}
