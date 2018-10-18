import {Lambda} from "./Lambda";
import {ExecutionTime} from "./ExecutionTime";

/**
 * The type of Lambda whose scaling is managed by the Daemon and has no state. Therefore,
 * can keep running until dead via timeout. The Daemon will decide if new instances need to be spawned.
 */
export abstract class DaemonManagedLambda extends Lambda {
    constructor(executionTime: ExecutionTime) {
        super(DaemonManagedLambda.handleTimeout, executionTime);
    }

    private static handleTimeout(continuation: () => Promise<void>) {
        // simply continue running until killed
        continuation().then(() => this.handleTimeout(continuation));
    }
}