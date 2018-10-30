import {Lambda, SQS} from 'aws-sdk';
import {CloudController} from '../../cloud/control/CloudController'
import {SimpleCloud} from '../../cloud/simple/SimpleCloud';
import {AlwaysOneStrategy} from '../../cloud/simple/AlwaysOneStrategy';
import {MilliSecondInterval} from '../../lib/MillisecondInterval';
import {TimeImmortalLambda} from "../TimeImmortalLambda";
import {MomentBasedExecutionTime} from "../../lib/ExecutionTime";
import {NumericSeconds, TimeUnit} from "../../lib/Seconds";

const SCHEDULING_INTERVAL = 5000 // ms
class DaemonLambda extends TimeImmortalLambda {

    private lambdaClient: Lambda
    private sqsClient: SQS
    private uuid: string

    constructor(sqsClient: SQS, lambdaClient: Lambda, uuid: string) {
        super(new MomentBasedExecutionTime(new NumericSeconds(4, TimeUnit.minutes)))

        this.lambdaClient = lambdaClient
        this.sqsClient = sqsClient
        this.uuid = uuid
    }

    async run() {
        // Create a cloud
        const cloud = new SimpleCloud(this.lambdaClient, this.sqsClient, this.uuid)

        // Pick a strategy
        const strategy = new AlwaysOneStrategy()

        // Wrap in a controller
        const controller = new CloudController(cloud, strategy, new MilliSecondInterval(SCHEDULING_INTERVAL))

        controller.start()
    }

    async implementation() {
    }
}

export default DaemonLambda;