export interface Queue<TMessage> {
    sendBatched(msgProvider: Iterator<TMessage>): Promise<void>;
    receive(msgConsumer: (string) => Promise<void>): Promise<void>;
}