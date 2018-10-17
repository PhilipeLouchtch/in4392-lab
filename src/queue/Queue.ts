export interface Queue<TMessage> {
    sendSingle(msg: TMessage): Promise<void>;
    sendBatched(msgProvider: Iterator<TMessage>): Promise<void>;
    receive(msgConsumer: (string) => Promise<void>): Promise<void>;
}