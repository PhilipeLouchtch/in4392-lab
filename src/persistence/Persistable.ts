export interface Persistable<T> {
    serialize(): string;
}