import "jasmine";
import { handler } from "../../packages/Daemon/index"
import { SimpleJobParams } from '../../src/job/SimpleJobRequest';

describe("Daemon", function () {

    var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("fires successfully", function (done) {

        const cb = console.log
        const JobRequest: SimpleJobParams = { limit: 100, param: 'hello' }
        const d = handler({ JobRequest }, {}, cb)

    })

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    
});
