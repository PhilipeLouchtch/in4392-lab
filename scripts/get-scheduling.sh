#!/bin/bash
function run () {

  if [[ "$1" = "" ]]
  then
    echo "Usage: $0 <start time in ms since 1970-01-01 00:00:00>"
    return 1
  fi

    aws logs filter-log-events --log-group-name /aws/lambda/Daemon --filter-pattern Scheduling --start-time $1 >> scheduling_$1.json

}

run "$1"
