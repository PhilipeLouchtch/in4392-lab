import { SQS, Lambda } from 'aws-sdk';
import { SimpleCloudComponents } from '../cloud/SimpleCloudComponents';
import { SimpleCloudBuilder } from '../cloud/SimpleCloudBuilder';
import { SimpleCloudController } from '../cloud/SimpleCloudController';

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
        const builder = new SimpleCloudBuilder(this.lambdaClient, this.sqsClient)
        const cloud: SimpleCloudComponents = await builder.createCloud(this.uuid)

        // Wrap in a controller
        const controller = new SimpleCloudController(cloud)

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
