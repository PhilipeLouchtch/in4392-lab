/**
 * A `Cloud` is a set of `CloudComponent`s such as `LambdaController` and `QueueController`.
 * Each implementation should display getters for each of its controllable and/or monitorable components.
 */
import {QueueMetrics} from "../metrics/QueueMetrics";

export interface Cloud {

    /** 
     * Spawn the cloud, by creating the queues and invoking the lambdas
     */
    spawn(): Promise<any>

    /** 
     * Kill the cloud
     */
    terminate(): Promise<any>

    queueMetrics(): QueueMetrics[]

}