import "jasmine";
import { handler } from "../../packages/Api/index"

describe("Api", function () {

    var originalTimeout;

    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("validates the param", function (done) {

        const param = JSON.stringify({ strategy: 'invalid' })
        const body = JSON.stringify({ limit: 1002, param })
        handler({ body, isBase64Encoded: false }, {})
            .then((e) => {
                expect(e.body).toBeDefined(".body not in response")
                expect(JSON.parse(e.body).error).toBeDefined("error not in body")
            })
            .then(done)

    })

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

});
