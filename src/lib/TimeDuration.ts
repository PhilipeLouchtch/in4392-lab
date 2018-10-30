export interface TimeDuration {
    greaterEqualTo(value: TimeDuration): boolean;
    toMilliSeconds(): number; // uuuuuggghhhh
}

export enum TimeUnit {
    milliseconds = 1,
    seconds = 1000 * milliseconds,
    minutes = 60 * seconds,
    hours = 60 * minutes,
    days = hours * 24
}

export class MilliSecondBasedTimeDuration implements TimeDuration {
    private readonly millis: number;

    constructor(value: number, unit: TimeUnit) {
        this.millis = value * unit.valueOf();
    }

    greaterEqualTo(value: TimeDuration): boolean {
        return this.millis >= value.toMilliSeconds();
    }

    toMilliSeconds(): number {
        return this.millis;
    }
}