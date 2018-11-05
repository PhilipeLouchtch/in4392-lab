import { WorkerMetrics } from "../WorkerMetrics";
import Lambda = require("aws-sdk/clients/lambda");
import CloudWatch = require("aws-sdk/clients/cloudwatch");
import { GetMetricDataInput } from "aws-sdk/clients/cloudwatch";
import moment = require("moment");

export class LambdaFunctionMetrics implements WorkerMetrics {

    constructor(private readonly lambdaClient: Lambda,
                private readonly cloudWatchClient: CloudWatch,
                private readonly functionName: string) {
    }

    getNumberOfActiveWorkers(): Promise<any> {
        const end = moment().seconds(0);
        const start = end.clone().subtract(15, "minutes");

        let henk: GetMetricDataInput = {
            MetricDataQueries: [{
                    Id: "henk",
                    MetricStat: {
                        Stat: "Sum",
                        Metric: {
                            Namespace: `AWS/Lambda`,
                            MetricName: `Invocations`,
                            Dimensions: [{
                                Name: "FunctionName",
                                Value: this.functionName
                            }]
                        },
                        Period: 60
                    },
                }
            ],
            StartTime: start.toDate(),
            EndTime: end.toDate()
        };

        return this.cloudWatchClient.getMetricData(henk).promise();

        // this.cloudWatchClient.getMetricData(henk).promise()
        //     .then(value => {
        //         value.MetricDataResults[0].
        //     })
        //
        // return undefined;
    }

    nameOfFunction(): string {
        return "";
    }

}