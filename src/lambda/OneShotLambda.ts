import {Lambda} from "./Lambda";
import {ExecutionTime} from "../lib/ExecutionTime";

/**
 * Type of lambda that is (assumed) to not need to be re-spawned or needs to have its state managed.
 * Once the timeout threshold is reached, its "implementation" function will no longer be called.
 *
 * The implementating instance is not notified when this occurs.
 */
export abstract class OneShotLambda extends Lambda {
    constructor(executionTime: ExecutionTime) {
        super(() => Promise.resolve(), executionTime);
    }
}