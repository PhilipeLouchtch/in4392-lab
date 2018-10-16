import "jasmine";
import {SimpleSource} from "../src/source/SimpleSource"
import {Message} from "../src/source/Message";

describe("test 1", () => {
    let simpleSource: SimpleSource;
    const template = "";

    beforeEach(() => {
        simpleSource = new SimpleSource(template);
    });

    it("should return unique messages", () => {
        const content = simpleSource.provideContent();
        const nextContent = simpleSource.provideContent();

        expect(content.data).not.toEqual(nextContent.data);
    });

    it("should generate content with this structure", () => {
        const content = simpleSource.provideContent();
        const nextContent = simpleSource.provideContent();

        expect(content.data).toBe(`${template} ${content.identifier}`);
        expect(nextContent.data).toBe(`${template} ${nextContent.identifier}`);
    });

    it("should increment counter for each next content", () => {
        const content = simpleSource.provideContent();
        const nextContent = simpleSource.provideContent();

        expect(content.identifier < nextContent.identifier).toBeTruthy();
    });

    it("should return same values with iterator", () => {
        const freshSimpleSource = new SimpleSource(template);

        const valuesNormal = [simpleSource.provideContent(), simpleSource.provideContent()];
        const valuesIterator = [freshSimpleSource.next().value, freshSimpleSource.next().value];

        expect(valuesNormal).toEqual(valuesIterator);
    });

    it("should handle massive concurrency", async () => {
        const promises: Promise<Message<string,string>>[] = [];

        const fn = resolve => {
            setTimeout(() => resolve(simpleSource.next().value), 2000);
        };

        let grouped: number[] = [];
        for (let i = 0; i < 100000; i++) {
            grouped[i] = 0;
            promises.push(new Promise(fn));
        }

        return Promise.all(promises)
            .then(msgs => {
                for (let msg of msgs)
                {
                    grouped[msg.identifier]++;
                }
            })
            .then(() =>
                expect(grouped).not.toContain(0)
            );
    })
});