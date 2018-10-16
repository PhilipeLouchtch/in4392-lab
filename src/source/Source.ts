export interface Source<T> extends Iterator<T> {
    provideContent();
}