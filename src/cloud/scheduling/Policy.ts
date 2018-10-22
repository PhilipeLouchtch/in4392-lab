import { SnapshotDict } from '../monitoring/SnapshotDict';
import { Schedule } from './Schedule';

/**
 * A Policy takes a Snapshot of the Cloud's performance and returns a Schedule
 */
export interface Policy {

    schedule(snapshot: SnapshotDict): Schedule

}
