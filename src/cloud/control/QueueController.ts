import { SQS } from 'aws-sdk';
import { QueueSnapshot } from '../monitoring/QueueSnapshot'
import { MakesSnapshot } from '../monitoring/MakesSnapshot'

/**
 * The QueueController creates and monitors an instance of the queue
 */
export class QueueController implements MakesSnapshot {

    private sqsClient: SQS
    private name: string
    private queueUrl: string | undefined

    constructor(sqsClient: SQS, name: string) {
        this.sqsClient = sqsClient
        this.name = name
    }

    public create() {
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

    async snapshot(): Promise<QueueSnapshot> {
        return new QueueSnapshot(await this.getApproximateSize())
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
