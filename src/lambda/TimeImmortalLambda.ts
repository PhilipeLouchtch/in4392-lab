import {Lambda} from "./Lambda";
import {ExecutionTime} from "../lib/ExecutionTime";

/**
 * The type of lambda that needs to be run perpetually. In other words, when the threshold
 * of execution time is reached, a new Lambda is spawned. The state of the current instance is
 * checkpointed and passed on the new instance (TODO: the latter).
 */
export abstract class TimeImmortalLambda extends Lambda {
    constructor(exectutionTime: ExecutionTime) {
        super(TimeImmortalLambda.executionTimeoutHandler, exectutionTime);
    }

    private static executionTimeoutHandler() {
        // TODO: spawn new instance of self, do not continue execution
        // also take care of saving current state and passing it on to next instance of self
        // awsLabda::spawn(self);
    }
}