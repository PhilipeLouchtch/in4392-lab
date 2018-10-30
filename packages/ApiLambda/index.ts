import ApiLambda from "../../src/lambda/ApiLambda"
import AWS = require('aws-sdk')

exports.handler = (event, context, callback) => {
    const s3Client = new AWS.S3()
    const lambda = new ApiLambda(s3Client)
    lambda.run(event, context, callback)
}
