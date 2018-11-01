export class WordCountOperation {

    constructor() {

    }

    count(input: String): number {
        let words = input.match(/\S+/g);

        if (!words) {
            return 0;
        }

        return words.length;
    }
}
