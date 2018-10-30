import { SQS, Lambda } from 'aws-sdk';
import { CloudController } from '../cloud/control/CloudController'
import { SimpleCloud } from '../cloud/simple/SimpleCloud';
import { AlwaysOneStrategy } from '../cloud/simple/AlwaysOneStrategy';
import { MilliSecondInterval } from '../lib/MillisecondInterval';

const SCHEDULING_INTERVAL = 5000 // ms
class DaemonLambda {

    private lambdaClient: Lambda
    private sqsClient: SQS
    private uuid: string

    constructor(sqsClient: SQS, lambdaClient: Lambda, uuid: string) {
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

        // setup queues, lambda, permissions
        // launch processing for the request
        // create persistence entry for running request

        // monitor runtime (idea: let the process monitor itself,
        // either through a monitor message or some smart pseudo-leader-election on the lambdas)

        // client will keep polling untill a result is available
    }
}

export default DaemonLambda
