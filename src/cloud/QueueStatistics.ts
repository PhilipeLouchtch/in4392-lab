import { QueueMetrics } from "./metrics/QueueMetrics";

interface StatisticSnapshot {
    milisFromJobStart: number,
    queueSnapshots: QueueSnapshot[]
}

interface QueueSnapshot {
    name: string,
    size: number
}

export class QueueStatistics {

    private readonly statistics: StatisticSnapshot[];

    constructor(private readonly jobStartTimeEpochMilis: number,
        private readonly queueMetrics: QueueMetrics[]) {
        this.statistics = [];
    }

    async recordSnapshot() {
        return Promise.all(this.queueMetrics.map(
            async (queueMetric, index) => {
                const size = await queueMetric.getApproximateMessageCount();
                return { name: queueMetric.nameOfQueue(), size: size, index: index };
            })).then(queueSnapshots => this.addSnapshot(queueSnapshots.sort((a, b) => a.index - b.index)));
    }

    private addSnapshot(snapshot: QueueSnapshot[]) {
        this.statistics.push({
            milisFromJobStart: Date.now() - this.jobStartTimeEpochMilis,
            queueSnapshots: snapshot
        });
    }

    asCsvString(): string {
        return [
            // Header
            [
                'milisFromStart',
                ...this.queueMetrics.map(m => m.nameOfQueue())
            ].join(','),
            // Rows
            ...this.statistics.map(s => [
                s.milisFromJobStart,
                ...s.queueSnapshots.map(s => s.size)
            ].join(','))
        ].join("\n")
    }
}