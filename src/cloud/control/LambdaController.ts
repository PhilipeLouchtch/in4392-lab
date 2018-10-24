import { Lambda } from 'aws-sdk';
import { HasMetrics } from '../metrics/HasMetrics'
import { LambdaMetrics } from '../metrics/LambdaMetrics'

/**
 * A `LambdaController` controls the amount of "workers" by invoking the `Lambda` it represents.
 * The amount of concurrent invocations is controlled by `LambdaController.setGoal(number)`.
 * 
 * Along with each invocation it passes the `Dependencies` which are the `QueueName`s
 * of the `Queue`s this `Lambda` depends upon.
 * 
 * For monitoring and scheduling, it can return `LambdaMetrics`
 */
export class LambdaController<T extends Object> implements HasMetrics {
    private deps: T
    private lambdaClient: Lambda
    private name: string
    private invocations: any = []
    private goal = 0

    constructor(lambdaClient: Lambda, lambdaName: string, dependencies: T) {
        this.deps = dependencies
        this.name = lambdaName
        this.lambdaClient = lambdaClient
    }

    /** Add workers when goal is not satisfied */
    run() {
        if (this.invocations.length < this.goal) {
            this.invoke().then(() => this.run())
        }
    }

    setGoal(goal: number) {
        this.goal = goal
        this.run()
    }

    private invoke() {
        return new Promise((resolve, reject) => {
            this.lambdaClient.invoke({ FunctionName: this.name, Payload: this.deps }, (err, data) => {
                if (err) reject(err)
                else {
                    this.invocations.push(data)
                    resolve(data)
                }
            })
        })
    }

    async getMetrics(): Promise<LambdaMetrics> {
        return new LambdaMetrics(this.goal) // FIXME should be actual count
    }

}
