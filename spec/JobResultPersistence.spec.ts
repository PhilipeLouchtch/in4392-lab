import "jasmine";
import {JobResultPersistance} from "../src/persistence/JobResultPersistance";
import {SimpleJobRequest} from "../src/job/SimpleJobRequest";
import {S3Persistence} from "../src/persistence/S3Persistence";
import S3 = require("aws-sdk/clients/s3");
import {JobResult} from "../src/job/JobResult";
import {JobStatus} from "../src/job/JobStatus";


describe("JobResultPersistence", function () {

    let jobResultPersistence: JobResultPersistance;
    let jobRequest: SimpleJobRequest;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        jobResultPersistence = new JobResultPersistance(new S3Persistence(new S3(), 'simple-jobs'));
        jobRequest = new SimpleJobRequest({limit: 123456789, param: "should not exist"});
        console.log("Job key: " + jobRequest.asKey())
    });

    it("saves successfully", async () => {
        return await jobResultPersistence.store(jobRequest, JobResult.ofNotStarted<string>())
            .then(() => jobResultPersistence.read(jobRequest))
            .then(value => {
                expect(value).toBeDefined();
                expect(value!.status).toBe(JobStatus.NOT_STARTED)
                return value;
            })
            .then(value => jobResultPersistence.store(jobRequest, value!.started()))
            .then(value => jobResultPersistence.read(jobRequest))
            .then(value => {
                expect(value).toBeDefined();
                expect(value!.status).toBe(JobStatus.RUNNING);
            })
    });

    afterEach(function () {
    });

});
