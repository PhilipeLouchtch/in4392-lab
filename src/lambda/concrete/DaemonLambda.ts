import {Lambda, SQS} from 'aws-sdk';
import {CloudController} from '../../cloud/control/CloudController'
import {SimpleCloud} from '../../cloud/simple/SimpleCloud';
import {AlwaysOneStrategy} from '../../cloud/simple/AlwaysOneStrategy';
import {TimeImmortalLambda} from "../TimeImmortalLambda";
import {ExecutionTime} from "../../lib/ExecutionTime";
import {IntervalExecution} from "../../lib/IntervalExecution";
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../lib/TimeDuration";
import {TimeBasedInterval} from "../../lib/TimeBasedInterval";

const SCHEDULING_INTERVAL = new MilliSecondBasedTimeDuration(5000, TimeUnit.milliseconds)

class DaemonLambda extends TimeImmortalLambda {

    private lambdaClient: Lambda
    private sqsClient: SQS
    private uuid: string
    private cloudControllerExecution?: Promise<IntervalExecution>

    constructor(executionTime: ExecutionTime, sqsClient: SQS, lambdaClient: Lambda, uuid: string) {
        super(executionTime)

        this.lambdaClient = lambdaClient
        this.sqsClient = sqsClient
        this.uuid = uuid
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
    async initialize() {
        // Create a cloud (setup queues, lambda, permissions)
        const cloud = new SimpleCloud(this.lambdaClient, this.sqsClient, this.uuid)

        // Select scheduling/scaling strategy
        const strategy = new AlwaysOneStrategy()

        // Wrap in a controller
        const controller = new CloudController(cloud, strategy, new TimeBasedInterval(SCHEDULING_INTERVAL))

        // launch processing for the request
        this.cloudControllerExecution = controller.start()
    }

    async implementation(): Promise<void> {
        if (!this.cloudControllerExecution) {
            this.initialize();
        }

        // TODO: prevent busy-waiting as this function will loop forever (externally)
    }
}

export default DaemonLambda