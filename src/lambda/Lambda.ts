import {ExecutionTime} from "./ExecutionTime";

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

    async run() {
        if (this.nearingLambdaTimeout()) {
            return this.lambdaLifespanTimeoutHandler(this.implementation);
        }
        else {
            return this.implementation().then(this.run);
        }
    }

    abstract async implementation(): Promise<void>;

    private nearingLambdaTimeout(): boolean {
        return this.executionTime.hasReachedThreshold();
    }
}