import { Lambda as AWSLambda, SQS } from 'aws-sdk';
import { CloudController } from '../../cloud/control/CloudController'
import { SimpleCloud } from '../../cloud/simple/SimpleCloud';
import { AlwaysOneStrategy } from '../../cloud/simple/AlwaysOneStrategy';
import { ExecutionTime } from "../../lib/ExecutionTime";
import { IntervalExecution } from "../../lib/IntervalExecution";
import { MilliSecondBasedTimeDuration, TimeUnit } from "../../lib/TimeDuration";
import { TimeBasedInterval } from "../../lib/TimeBasedInterval";
import { TimeDurationDelay } from "../../lib/TimeDurationDelay";
import { JobStatus } from '../../job/JobStatus';
import { Persistence } from '../../persistence/Persistence';
import { SimpleJobRequest, SimpleJobResult } from '../../job/SimpleJobRequest';
import { JobResult } from '../../job/JobResult';
import { Cloud } from '../../cloud/control/Cloud';
import { QueueStatistics } from "../../cloud/QueueStatistics";
import { S3Persistence } from "../../persistence/S3Persistence";
import S3 = require("aws-sdk/clients/s3");
import { StaticProportionalStrategy } from '../../cloud/simple/StaticProportionalStrategy';
import { Lambda } from '../Lambda';

const SCHEDULING_INTERVAL = new MilliSecondBasedTimeDuration(5000, TimeUnit.milliseconds)

type JobResultType = string;
class DaemonLambda extends Lambda {

    // private lambdaClient: Lambda
    // private sqsClient: SQS
    // private uuid: string
    private cloudControllerExecution?: IntervalExecution
    private delay: TimeDurationDelay;
    private done: boolean = false;
    private cloud?: Cloud;
    private queueStatistics?: QueueStatistics;

    constructor(executionTime: ExecutionTime,
        private sqsClient: SQS,
        private lambdaClient: AWSLambda,
        private job: SimpleJobRequest,
        private persistence: Persistence<JobResult<JobResultType>>,
        private uuid: string) {

        super(() => this.finalize(true), executionTime)
        this.delay = new TimeDurationDelay(new MilliSecondBasedTimeDuration(5, TimeUnit.seconds))
    }

    /*
       Any function here should be either idempotent or be able to be serialized and resumed
       current code is idempotent:

          * Lambdas are spawned according to the selected strategy.
              As long as it's relatative to the live state of the cloud environment,
              i.e. makes decisions relative to the metrics. And not absolute (e.g.
              unconditionally spawn a lambda)

          * Queues are created only if they do not exist yet and only when a queue
              operation is actually requested (see QueueUrlOrOfNewOrExisting)

    */
    async initAndStartCloudController() {
        console.log("Daemon: Starting Cloud")

        // Create a cloud (setup queues, lambda, permissions)
        this.cloud = new SimpleCloud(this.lambdaClient, this.sqsClient, this.uuid, this.job)

        // Select scheduling/scaling strategy
        const prop = this.job.parameters.param.match(/prop:([0-9]+)/)
        const strategy = prop
            ? new StaticProportionalStrategy(this.job, parseInt(prop[1]))
            : new AlwaysOneStrategy()

        // Wrap in a controller
        const controller = new CloudController(this.cloud, strategy, new TimeBasedInterval(SCHEDULING_INTERVAL))

        // Mark the job as started
        let jobResult = await this.markJobStatusStarted();

        // Init statistics tracking
        this.queueStatistics = new QueueStatistics(jobResult.startedOn!, this.cloud.queueMetrics());

        // launch processing for the request
        return controller.start()
    }

    private async markJobStatusStarted() {
        let jobResult = await this.persistence.read((this.job));

        if (!jobResult) {
            // wasn't there for some reason, can recover
            jobResult = JobResult.ofNotStarted<JobResultType>().started();
        }
        jobResult = jobResult.started();

        await this.persistence.store(this.job, jobResult);
        return jobResult;
    }

    private async markJobStatusTimedout() {
        let jobResult = await this.persistence.read((this.job));

        if (!jobResult) {
            // wasn't there for some reason, can recover
            jobResult = JobResult.ofNotStarted<JobResultType>().started();
        }
        jobResult = jobResult.timedout();

        await this.persistence.store(this.job, jobResult);
        return jobResult;
    }

    async implementation(): Promise<void> {
        if (!this.cloudControllerExecution) {
            this.cloudControllerExecution = await this.initAndStartCloudController();
        }

        await this.queueStatistics!.recordSnapshot();

        // Mark as done when the job is completed
        await this.persistence.read(this.job).then(async (jobData: JobResult<SimpleJobResult> | undefined) => {
            this.done = !!jobData && jobData.status === JobStatus.COMPLETED
            if (this.done && this.cloud) {
                console.log("Storing Job Statistics")
                await new S3Persistence(new S3(), 'job-statics')
                    .store(this.job, this.queueStatistics!.asCsvString());

                await this.finalize()
            }
        })

        if(!this.done)
            return this.delay.delay();
    }

    protected continueExecution(): boolean {
        return !this.done;
    }

    protected async finalize(becauseTimeout: boolean = false): Promise<any> {
        console.log(`DaemonLambda: Finalizing` + (becauseTimeout ? ` because of timeout`: ``))
        if (becauseTimeout)
            await this.markJobStatusTimedout()

        await this.cloud!.terminate()
        this.cloudControllerExecution!.stop()
    }
}

export default DaemonLambda