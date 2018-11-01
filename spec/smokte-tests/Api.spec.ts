import "jasmine";
import { handler } from "../../packages/Api/index"
import { SimpleJobParams } from '../../src/job/SimpleJobRequest';

describe("Api", function () {

    var originalTimeout;

    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("fires successfully", function (done) {

        const data: SimpleJobParams = { limit: 1002, param: 'hello' }
        const d = handler({ data }, {})
            .then(console.log)
            .catch(console.error)

    })

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

});
