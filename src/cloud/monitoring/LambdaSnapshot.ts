import { Snapshot } from "./Snapshot"

/**
 * A LambdaSnapshot gathers the number of concurrently
 * running lambdas.
 */
export class LambdaSnapshot implements Snapshot {

    /** The number of concurrently running lambdas */
    private count: number

    constructor(count: number) {
        this.count = count;
    }

    getCount() {
        return this.count
    }

}
