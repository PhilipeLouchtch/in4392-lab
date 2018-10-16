import SQS = require("aws-sdk/clients/sqs");
import {Source} from "../source/Source";
import {JobRequest} from "../JobRequest";
import {SendMessageBatchResult} from "aws-sdk/clients/sqs";
import {SqsQueue} from "../lib/SqsQueue";
import {Message} from "../source/Message";
import {AWSError} from "aws-sdk";
import {Request} from "aws-sdk/lib/request"

// @ts-ignore
export class FeedLambda {
    private datasourceQueue: SqsQueue<Message<string, string>>;
    private source: Source<Message<string, string>>;
    private job: JobRequest;

    constructor(sqs: SQS, source: Source<Message<string, string>>, job: JobRequest) {
        this.datasourceQueue = new SqsQueue(sqs, "datasource");
        this.source = source;
        this.job = job;
    }

    async run() {
        let dataLimit = this.job.limit;

        // TODO: can't the TS compiler infer the type somehow?
        const promises : Promise<Request<SendMessageBatchResult, AWSError>>[] = [];

        for (let i = 0; i < dataLimit; i += 10) {
            // TODO: check for race conditions wrt the source
            promises.push(this.datasourceQueue.sendBatched(this.source));
        }

        return Promise.all(promises);
    }
}