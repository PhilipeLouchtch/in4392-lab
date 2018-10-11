class WordCountOperation {
    count(input: String): number {
        let words = input.match(/\S+/g);
        return words.length;
    }
}