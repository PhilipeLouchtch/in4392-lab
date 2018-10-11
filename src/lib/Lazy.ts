export class Lazy<T> {
    private value?: T;
    private valueProvider: ()=> T | undefined;

    public constructor(valueProvider: () => T) {
        this.valueProvider = valueProvider;
    }

    public get(): T {
        // idea is simple, if 'value' is not yet computed
        // use the initFn to compute the value and return the value.

        // Optimizations:
        // - memory optimization: clear valueProvider (it might have a closure
        // keeping big objects from being GC'd). Can't just null or undefine it,
        // so assigning the simplest function that is conform the signature.
        //   The lack of staigt-forwardness is due to strict typing of TS

        if (!this.value) {
            this.value = this.valueProvider();
            // Clear ref to the init function
            this.valueProvider = () => this.value;
        }

        if (!this.value) {
            throw Error("Lazy's InitFn provided an 'undefined' value, cannot continue");
        }

        return this.value;
    }
}