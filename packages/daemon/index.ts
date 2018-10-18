import DaemonLambda from "../../src/lambda/concrete/DaemonLambda"
import {MomentBasedExecutionTime} from "../../src/lambda/ExecutionTime";
import {NumericSeconds, TimeUnit} from "../../src/lambda/Seconds";

const execTime = new MomentBasedExecutionTime(new NumericSeconds(4, TimeUnit.minutes));
const lambda = new DaemonLambda(execTime);

lambda.run();
