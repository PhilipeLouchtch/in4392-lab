import "jasmine";
import {SimpleSource} from "../src/source/SimpleSource"
import {Message} from "../src/source/Message";

describe("test 1", () => {
    let simpleSource: SimpleSource;
    let content: Message<string,string>;
    let nextContent: Message<string,string>;

    const template = "";

    beforeEach(() => {
        simpleSource = new SimpleSource(template);

        content = simpleSource.provideContent();
        nextContent = simpleSource.provideContent();
    });

    it("should return unique messages", () => {
        expect(content.data).not.toEqual(nextContent.data);
    });

    it("should generate content with this structure", () => {
        expect(content.data).toBe(`${template} ${content.identifier}`);
        expect(nextContent.data).toBe(`${template} ${nextContent.identifier}`);
    });

    it("should increment counter for each next content", () => {
        expect(content.identifier < nextContent.identifier).toBeTruthy();
    });

    it("should return same values with iterator", () => {
        const freshSimpleSource = new SimpleSource(template);

        const valuesNormal = [content, nextContent];
        const valuesIterator = [freshSimpleSource.next().value, freshSimpleSource.next().value];

        expect(valuesNormal).toEqual(valuesIterator);
    });
});