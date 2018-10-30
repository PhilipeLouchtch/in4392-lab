import ApiLambda from "../../src/lambda/ApiLambda"

const lambda = new ApiLambda();

exports.handler = (event, context, callback) => lambda.run(event, context, callback)
