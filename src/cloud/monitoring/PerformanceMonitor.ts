import { MakesSnapshot } from './MakesSnapshot'
import { SnapshotDict } from './SnapshotDict'

type DictOfMakesSnapshot = { [d: string]: MakesSnapshot }

/**
 * Take a bag of cloud component controllers and take snapshots of their
 * current performance.
 */
export class PerformanceMonitor {

    private cloud: DictOfMakesSnapshot

    constructor(cloud: DictOfMakesSnapshot) {
        this.cloud = cloud
    }

    /** Simply take the snapshot of each Snapshottable and merge into a dictionary */
    async snapshot(): Promise<SnapshotDict> {
        const keys = Object.keys(this.cloud)
        const promises = keys.map(k => this.cloud[k].snapshot())
        const snapshots = await Promise.all(promises)

        return keys.reduce((dict, key, index) => ({ ...dict, [key]: snapshots[index] }), {})
    }

}
