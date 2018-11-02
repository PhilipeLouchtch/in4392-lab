import {QueueMetrics} from "./metrics/QueueMetrics";

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
                return {name: queueMetric.nameOfQueue(), size: size, index: index};
            })).then(queueSnapshots => this.addSnapshot(queueSnapshots.sort((a, b) => a.index-b.index)));
    }

    private addSnapshot(snapshot: QueueSnapshot[]) {
        this.statistics.push({
            milisFromJobStart: Date.now() - this.jobStartTimeEpochMilis,
            queueSnapshots: snapshot
        });
    }

    asCsvString(): string {
        let csvString = `milisFromStart`;
        for (let i = 0; i < this.queueMetrics.length; i++) {
            csvString += ',' + this.queueMetrics[i].nameOfQueue();
        }

        for (let i = 0; i < this.statistics.length; i++) {
            let statistic = this.statistics[i];
            csvString += '\n' + statistic.milisFromJobStart;

            for (let j = 0; j < statistic.queueSnapshots.length; j++) {
                let queueSnapshot = statistic.queueSnapshots[j];
                csvString += ',' + queueSnapshot.size;
            }
        }

        return csvString;
    }
}