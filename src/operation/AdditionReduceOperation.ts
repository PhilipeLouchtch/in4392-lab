import {ReduceOperation} from "./ReduceOperation";

export class AdditionReduceOperation implements ReduceOperation<string> {
    constructor(private readonly convert: (string) => number) {
    }

    reduce(one: string, two: string): string {
        let number = this.convert(one) + this.convert(two);
        return number.toString();
    }
}