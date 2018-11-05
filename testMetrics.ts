import { LambdaFunctionMetrics } from "./src/cloud/metrics/concrete/LambdaFunctionMetrics";
import Lambda = require("aws-sdk/clients/lambda");
import CloudWatch = require("aws-sdk/clients/cloudwatch");
import AWS = require("aws-sdk");

AWS.config.update({region: 'us-west-2'});

let lambdaFunctionMetrics = new LambdaFunctionMetrics(new Lambda(), new CloudWatch(), "ProcessStepOne");
let numberOfActiveWorkers = lambdaFunctionMetrics.getNumberOfActiveWorkers();
let promise = numberOfActiveWorkers.then(value => {
    console.log(value)
    let dataResult = value.MetricDataResults[0];
    console.log(dataResult.Timestamps);
});