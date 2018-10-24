import { SQS } from 'aws-sdk'
import { QueueMetrics } from '../metrics/QueueMetrics'
import { HasMetrics } from '../metrics/HasMetrics'

/**
 * A `QueueController` controls the `SQSQueue` by spawning it.
 * For monitoring and scheduling, it can return `QueueMetrics`.
 */
export class QueueController implements HasMetrics {

    private sqsClient: SQS
    private name: string
    private queueUrl: string | undefined

    constructor(sqsClient: SQS, name: string) {
        this.sqsClient = sqsClient
        this.name = name
    }

    public spawn() {
        return new Promise<string>((resolve, reject) => {
            this.sqsClient.createQueue({ QueueName: name }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    this.sqsClient.getQueueUrl({ QueueName: name }, (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            this.queueUrl = data.QueueUrl
                            resolve(data.QueueUrl)
                        }
                    })
                }
            })
        })
    }

    async getMetrics(): Promise<QueueMetrics> {
        return new QueueMetrics(await this.getApproximateSize())
    }

    public async getApproximateSize() {
        if (!this.queueUrl)
            throw new Error("Cannot fetch size without Queue URL")
        try {
            const attrs = await this.sqsClient.getQueueAttributes({
                QueueUrl: this.queueUrl,
                AttributeNames: ["ApproximateNumberOfMessages"]
            }).promise()

            if (attrs.Attributes)
                return Number.parseInt(attrs.Attributes.ApproximateNumberOfMessages)
            else
                return 0
        } catch (err) {
            throw err
        }
    }

}
