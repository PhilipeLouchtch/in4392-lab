import DaemonLambda from "../../src/lambda/concrete/DaemonLambda"
import {MilliSecondBasedTimeDuration, TimeUnit} from "../../src/lib/TimeDuration";
import {MomentBasedExecutionTime} from "../../src/lib/ExecutionTime";

const execTime = new MomentBasedExecutionTime(new MilliSecondBasedTimeDuration(4, TimeUnit.minutes));
const lambda = new DaemonLambda(execTime);

lambda.run();
