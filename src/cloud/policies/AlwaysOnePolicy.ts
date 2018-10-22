import { SnapshotDict } from '../monitoring/SnapshotDict'
import { Policy } from "../scheduling/Policy"
import { Schedule } from '../scheduling/Schedule'

/**
 * This Policy always schedules one concurrent lambda of each type
 */
export class AlwaysOnePolicy implements Policy {

    schedule(snap: SnapshotDict): Schedule {
        return {
            feedLambda: 1,
            stepOneLambda: 1,
            reduceLambda: 1,
        }
    }

}
