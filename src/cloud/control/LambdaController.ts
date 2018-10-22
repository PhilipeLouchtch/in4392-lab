import { Lambda } from 'aws-sdk';
import { MakesSnapshot } from '../monitoring/MakesSnapshot'
import { LambdaSnapshot } from '../monitoring/LambdaSnapshot'

/**
 * The LambdaController ensures that the desired amount of workers run
 * concurrently. The user can control the number of workers by means
 * of a goal.
 */
export class LambdaController<T extends Object> implements MakesSnapshot {
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

    async snapshot(): Promise<LambdaSnapshot> {
        return new LambdaSnapshot(this.goal) // FIXME should be actual count
    }

}
