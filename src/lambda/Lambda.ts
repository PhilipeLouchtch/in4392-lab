import {ExecutionTime} from "../lib/ExecutionTime";

function sealed(target, key,descriptor) {
    descriptor.writable = false; // Prevent method to be overriden
}

export abstract class Lambda {

    /**
     * @param lambdaLifespanTimeoutHandler The handler when the Lambda has reached execution-timeout threshold.
     *  The continuation argument, is the function that executes the next Lambda operation, the handler is tasked with
     *  deciding what to do. Don't call (stop execution), call once (do one more op) or more than once (handler needs to handle this self)
     * @param executionTime
     */
    constructor(private readonly lambdaLifespanTimeoutHandler: (continuation: typeof Lambda.prototype.implementation) => void,
                private readonly executionTime: ExecutionTime) {
    }

    @sealed
    async run() {
        // Note: if the timeout handler does not explicitly continues the loop,
        // (by using the supplied fn and chaining it by itself), the loop is exited.
        if (this.nearingLambdaTimeout()) {
            return this.lambdaLifespanTimeoutHandler(this.implementation);
        }

        if (this.continueExecution()) {
            return this.implementation().then(this.run.bind(this));
        }

        return Promise.resolve();
    }

    protected abstract async implementation(): Promise<void>;

    protected abstract continueExecution(): boolean;

    private nearingLambdaTimeout(): boolean {
        return this.executionTime.hasReachedThreshold();
    }
}