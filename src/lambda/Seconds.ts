export interface Seconds {
    greaterEqualTo(value: Seconds): boolean;
    toNumber(): number; // uuuuuggghhhh
}

export enum TimeUnit {
    seconds = 1, minutes = 60
}

export class NumericSeconds implements Seconds {
    private readonly seconds: number;

    constructor(value: number, unit: TimeUnit) {
        this.seconds = value * unit.valueOf();
    }

    greaterEqualTo(value: Seconds): boolean {
        return this.seconds >= value.toNumber();
    }

    toNumber(): number {
        return this.seconds;
    }
}