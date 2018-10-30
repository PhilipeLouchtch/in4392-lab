import ApiLambda from "../../src/lambda/ApiLambda"

const lambda = new ApiLambda();

exports.handler = lambda.run
