export interface Message<TIdentifier, TData> {
    readonly identifier : TIdentifier;
    readonly data : TData;
}