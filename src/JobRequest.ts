export class JobRequest {
    private readonly _limit: number;

    constructor (limit: number) {
        this._limit = limit;
    }

    public get limit() : number {
        return this._limit;
    }
}