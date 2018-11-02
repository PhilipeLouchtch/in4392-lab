import {Keyable} from "../lib/Keyable"

export interface Persistence<T> {
    store(key: Keyable, value: T): Promise<void>
    read(key: Keyable): Promise<T | undefined>
}
