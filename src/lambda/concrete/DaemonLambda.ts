class DaemonLambda {
    constructor() {
    }

    run() {
        // setup queues, lambda, permissions
        // launch processing for the request
        // create persistence entry for running request

        // monitor runtime (idea: let the process monitor itself,
        // either through a monitor message or some smart pseudo-leader-election on the lambdas)

        // client will keep polling untill a result is available
    }
}

export default DaemonLambda
