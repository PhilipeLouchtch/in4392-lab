# Cloud

A `Cloud` is a set of `CloudComponent`s such as `LambdaController` and `QueueController`.
Each implementation should display getters for each of its controllable and/or monitorable components.

A `LambdaController` controls the amount of "workers" by invoking the `Lambda` it represents.
The amount of concurrent invocations is controlled by `LambdaController.setGoal(number)`.
Along with each invocation it passes the `Dependencies` which are the `QueueName`s of the `Queue`s this `Lambda` depends upon.
For monitoring and scheduling, it can return `LambdaMetrics`

A `QueueController` controls the `SQSQueue` by spawning it.
For monitoring and scheduling, it can return `QueueMetrics`.

A `CloudController` takes a `Cloud` and a `SchedulingStrategy`. 
It spawns the `Cloud` and reschedules at a certain interval by calling `SchedulingStrategy.schedule()`.

A `SchedulingStrategy` is specific to a particular `Cloud` implementation. 
It may request metrics by `.getMetrics()` upon each of the components and
schedule the workers by calling `LambdaController.setGoal(number)`.
