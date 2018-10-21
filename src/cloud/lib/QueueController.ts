import { SQS } from 'aws-sdk';

export class QueueController {

    private sqsClient: SQS
    private name: string

    constructor(sqsClient: SQS, name: string) {
        this.sqsClient = sqsClient
        this.name = name
    }

    public async create() {
        return new Promise<string>((resolve, reject) => {
            this.sqsClient.createQueue({ QueueName: name }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    this.sqsClient.getQueueUrl({ QueueName: name }, (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data.QueueUrl)
                        }
                    })
                }
            })
        })
    }

}
