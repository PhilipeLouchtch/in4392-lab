import SQS = require("aws-sdk/clients/sqs");
import {Source} from "../../source/Source";
import {JobRequest} from "../../JobRequest";
import {SendMessageBatchResult} from "aws-sdk/clients/sqs";
import {SqsQueue} from "../../lib/SqsQueue";
import {Message} from "../../source/Message";
import {AWSError} from "aws-sdk";
import {Request} from "aws-sdk/lib/request"
import {MomentBasedExecutionTime} from "../ExecutionTime";
import {NumericSeconds, TimeUnit} from "../Seconds";
import {OneShotLambda} from "../OneShotLambda";

export class FeedLambda extends OneShotLambda {
    private datasourceQueue: SqsQueue<Message<string, string>>;
    private source: Source<Message<string, string>>;
    private job: JobRequest;

    constructor(sqs: SQS, source: Source<Message<string, string>>, job: JobRequest) {
        super(new MomentBasedExecutionTime(new NumericSeconds(4, TimeUnit.minutes)));

        this.datasourceQueue = new SqsQueue(sqs, "datasource");
        this.source = source;
        this.job = job;
    }

    // TODO: Investigate need to turn into ImmortalLambda, if cannot drain source fast enough
    // then will have to extend source with a checkpoint save/restore functionality
    async implementation() {
        let dataLimit = this.job.limit;

        const promises: Promise<Request<SendMessageBatchResult, AWSError>>[] = [];

        for (let i = 0; i < dataLimit; i += 10) {
            promises.push(this.datasourceQueue.sendBatched(this.source));
        }

        return Promise.all(promises)
            .then(() => {});
    }
}

export default FeedLambda
