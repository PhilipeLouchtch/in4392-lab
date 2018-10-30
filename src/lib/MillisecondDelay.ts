import {Delay} from "./Delay";

export class MillisecondDelay implements Delay {
    constructor(private readonly amount: number) {
    }

    delay(): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, this.amount));
    }
}