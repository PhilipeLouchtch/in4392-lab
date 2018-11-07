import "jasmine";
import { handler } from "../../packages/WordCount/index"

describe("ProcessStepOne", function () {

    var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("fires successfully", function (done) {

        const cb = console.log
        const context = { getRemainingTimeInMillis: () => 30000 }
        const d = handler({  input_queue: "q1_abc", output_queue: "q2_abc", JobRequest: { param: "x", limit: 10 } }, context, cb)

    })

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    
});
