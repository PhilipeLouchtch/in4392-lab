import { Lambda } from 'aws-sdk';
import { HasMetrics } from '../metrics/HasMetrics'
import { WorkerMetrics } from '../metrics/WorkerMetrics'
import { CreateFunctionRequest } from "aws-sdk/clients/lambda";
import { JobRequest } from "../../job/JobRequest";

/**
 * A `LambdaController` controls the amount of "workers" by invoking the `Lambda` it represents.
 * The amount of concurrent invocations is controlled by `LambdaController.setGoal(number)`.
 * 
 * Along with each invocation it passes the `Dependencies` which are the `QueueName`s
 * of the `Queue`s this `Lambda` depends upon.
 * 
 * For monitoring and scheduling, it can return `LambdaMetrics`
 */
export class LambdaFunctionLifecycle<T extends Object, TJobResultData> implements HasMetrics<WorkerMetrics> {

    private invocations: any[] = []
    private pending: number = 0
    private goal = 0

    private readonly _functionBaseName: string;
    private readonly _functionName: string;

    constructor(private readonly lambdaClient: Lambda,
                private readonly jobRequest: JobRequest<TJobResultData>,
                private readonly dependencies: T,
                lambdaName: string) {
        this._functionBaseName = lambdaName;
        this._functionName = `${this._functionBaseName}_${this.jobRequest.asKey().slice(0, 8)}`;
    }

    initialize() {
        // Create the function
        const createFunctionRequest: CreateFunctionRequest = {
            Code: {
                S3Bucket: "lambda-fns",
                S3Key: `${this.functionName()}.zip`
            },
            FunctionName: this.functionName(),
            Handler: "index.handler",
            Role: "arn:aws:iam::243042562710:role/lambda_fa",
            Runtime: "nodejs8.10",
        };

        return this.lambdaClient.createFunction(createFunctionRequest).promise();
    }

    functionName() {
        return this._functionName;
    }

    run() {
        if (this.invocations.length < this.goal) {
            this.spawnWorker().then(() => this.run())
        }
    }

    /** Add workers until goal is satisfied */
    async scaleUpUntil(numberOfWorkers: number) {
        // Adjust the goal
        this.goal = numberOfWorkers

        // Spawn until goal reached
        while (this.invocations.length + this.pending < numberOfWorkers) {
            await this.spawnWorker()
        }
    }

    private spawnWorker() {
        this.pending++
        let functionName = this.functionName();

        console.log(`LambdaController(${functionName}): spawning..`)
        return new Promise((resolve, reject) => {
            this.lambdaClient.invoke({ FunctionName: functionName, InvocationType: "Event", Payload: JSON.stringify(this.dependencies) }, (err, data) => {
                if (err) {
                    console.error(`LambdaController(${functionName}): could not invoke.`, err)
                    reject(err)
                } else {
                    console.log(`LambdaController(${functionName}): successfully invoked.`)
                    this.invocations.push(data)
                    resolve(data)
                }
                this.pending--
            })
        })
    }

    getMetrics(): WorkerMetrics {
        let lifecycle = this;

        return new class implements WorkerMetrics {
            getNumberOfActiveWorkers(): Promise<number> {
                return Promise.resolve(lifecycle.invocations.length);
            }

            nameOfFunction(): string {
                return lifecycle.functionName();
            }
        }
    }
}
