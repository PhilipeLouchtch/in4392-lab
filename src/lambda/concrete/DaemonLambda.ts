import { Lambda, SQS } from 'aws-sdk';
import { CloudController } from '../../cloud/control/CloudController'
import { SimpleCloud } from '../../cloud/simple/SimpleCloud';
import { AlwaysOneStrategy } from '../../cloud/simple/AlwaysOneStrategy';
import { TimeImmortalLambda } from "../TimeImmortalLambda";
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

const SCHEDULING_INTERVAL = new MilliSecondBasedTimeDuration(5000, TimeUnit.milliseconds)

type JobResultType = string;
class DaemonLambda extends TimeImmortalLambda {

    // private lambdaClient: Lambda
    // private sqsClient: SQS
    // private uuid: string
    private cloudControllerExecution?: Promise<IntervalExecution>
    private delay: TimeDurationDelay;
    private done: boolean = false;
    private cloud?: Cloud;

    constructor(executionTime: ExecutionTime,
        private sqsClient: SQS,
        private lambdaClient: Lambda,
        private job: SimpleJobRequest,
        private persistence: Persistence<JobResult<JobResultType>>,
        private uuid: string) {

        super(executionTime)
        this.delay = new TimeDurationDelay(new MilliSecondBasedTimeDuration(10, TimeUnit.seconds))
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
        const strategy = new AlwaysOneStrategy()

        // Wrap in a controller
        const controller = new CloudController(this.cloud, strategy, new TimeBasedInterval(SCHEDULING_INTERVAL))

        // Mark the job as started
        this.markJobStatusStarted()

        // launch processing for the request
        return controller.start()
    }

    private async markJobStatusStarted() {
        let jobStatus = await this.persistence.read((this.job));

        if (!jobStatus) {
            // wasn't there for some reason, can recover
            jobStatus = JobResult.ofNotStarted<JobResultType>().started();
        }
        else {
            jobStatus = jobStatus.started();
        }

        return this.persistence.store(this.job, jobStatus);
    }

    async implementation(): Promise<void> {
        if (!this.cloudControllerExecution) {
            this.cloudControllerExecution = this.initAndStartCloudController();
        }
        
        // Mark as done when the job is completed
        await this.persistence.read(this.job).then(async (jobData: JobResult<SimpleJobResult> | undefined) => {
            this.done = !!jobData && jobData.status === JobStatus.COMPLETED
            if(this.done && this.cloud){
                await this.cloud.terminate()
            }
        })

        return this.delay.delay();
    }

    protected continueExecution(): boolean {
        return !this.done;
    }
}

export default DaemonLambda