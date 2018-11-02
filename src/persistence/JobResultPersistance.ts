import {Persistence} from "./Persistence";
import {Keyable} from "../lib/Keyable";
import {JobResult} from "../job/JobResult";

type JobData = string;
export class JobResultPersistance implements Persistence<JobResult<JobData>> {

    constructor(private readonly persister: Persistence<string>) {
    }

    read(key: Keyable): Promise<JobResult<JobData> | undefined> {
        return this.persister.read(key)
            .then(value => {
                if(value) {
                    return JobResult.fromSerialized<JobData>(value);
                }

                // or return undefined if nothing found
                return;
            })
    }

    store(key: Keyable, value: JobResult<JobData>): Promise<void> {
        return this.persister.store(key, value.serialize());
    }

}