import "jasmine";
import { handler } from "../../packages/SummingReduce/index"

describe("SummingReduce", function () {

    var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("fires successfully", function (done) {

        const cb = console.log
        const d = handler({  step_one: "q1_abc", step_two: "q2_abc" }, {}, cb)

    })

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    
});
