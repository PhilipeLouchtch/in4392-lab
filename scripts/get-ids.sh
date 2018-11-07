#!/bin/bash
function run () {

  if [[ "$1" = "" ]]
  then
    echo "Usage: $0 <start time in ms since 1970-01-01 00:00:00>"
    return 1
  fi

    aws logs filter-log-events --log-group-name /aws/lambda/Daemon --filter-pattern "Invoked for Job" --start-time $1 >> ids_daemon_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/Feed --filter-pattern "Invoked for Job" --start-time $1 >> ids_feed_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/ProcessStepOne --filter-pattern "Invoked for Job" --start-time $1 >> ids_one_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/WordCount --filter-pattern "Invoked for Job" --start-time $1 >> ids_word_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/SummingReduce --filter-pattern "Invoked for Job" --start-time $1 >> ids_reduce_$1.json

}

run "$1"
