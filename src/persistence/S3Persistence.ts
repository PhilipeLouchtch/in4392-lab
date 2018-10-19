import {Persistence} from "./Persistence";
import {JobRequest} from "../JobRequest";
import {Keyable} from "../lib/Keyable";
import S3 = require("aws-sdk/clients/s3");


export class S3Persistence<T> implements Persistence<T> {
    private bucketName: string;

    constructor(private readonly s3Client: S3) {
        this.bucketName = "big_assignment";
    }

    async read(key: JobRequest): Promise<T | undefined> {
        return this.s3Client.getObject({Bucket: this.bucketName, Key: key.asKey()}).promise()
            .then(value => {
                if (value.$response) {
                    if (value.$response.error) {
                        console.error(value.$response.error);
                        return Promise.reject(value.$response.error);
                    }
                    else if (value.$response.data && value.$response.data.Body) {
                        // TODO: test if this works...
                        return JSON.parse(value.$response.data.Body.toString());
                    }
                }
                return Promise.reject();
            })
    }

    async store(key: Keyable, value: T) {
        const serializedValue = JSON.stringify(value);

        return this.s3Client.putObject({Bucket: this.bucketName, Key: key.asKey(), Body: serializedValue}).promise()
            .then(result => {
                if (result.$response && result.$response.error) {
                    console.error(result.$response.error);
                }
            });
    }

}