import SQS = require("aws-sdk/clients/sqs");
import {Source} from "../source/Source";
import {JobRequest} from "../JobRequest";
import {SendMessageBatchRequest} from "aws-sdk/clients/sqs";

class DataSourceLambda {
    private sqs: SQS;
    private source: Source<String>;
    private job: JobRequest;

    constructor(sqs: SQS, source: Source<String>, job: JobRequest) {
        this.sqs = sqs;
        this.source = source;
        this.job = job;
    }

    // TODO: check how this function handles long promise chains (order of thousands)
    async run() {

        let dataLimit = this.job.limit;

        // hacky promise chain of batches
        let promise = new Promise(resolve => resolve());
        for (let i = 0; i < dataLimit; i += 10) {
            promise.then(() => {
                return this.sqs.sendMessageBatch(this.makeSqsBatch(dataQueueUrl)).promise();
            })
        }

        return promise;
    }

    private makeSqsBatch(queueUrl: string) : SendMessageBatchRequest {
        let msgs = [];
        for(let i = 0; i < 10; i++) {
            let iteratorResult = this.source.next();

            if (iteratorResult.done == false){
                msgs.push(iteratorResult.value);
            }
        }

        return {QueueUrl: queueUrl, Entries: msgs}
    }
}