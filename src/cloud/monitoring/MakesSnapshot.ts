import { Snapshot } from "./Snapshot"

/**
 * Cloud Component Controllers should monitor themselves and return a
 * Snapshot of their performance when requested
 */
export interface MakesSnapshot {

    snapshot(): Promise<Snapshot>

}
