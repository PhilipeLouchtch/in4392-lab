import {Keyable} from "../lib/Keyable"

export interface Persistence<TValue> {
    store(key: Keyable, value: TValue): Promise<void>
    read(key: Keyable): Promise<TValue | undefined>
}
