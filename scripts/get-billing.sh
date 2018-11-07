#!/bin/bash
function run () {

  if [[ "$1" = "" ]]
  then
    echo "Usage: $0 <start time in ms since 1970-01-01 00:00:00>"
    return 1
  fi

    aws logs filter-log-events --log-group-name /aws/lambda/Daemon --filter-pattern REPORT --start-time $1 >> billing_daemon_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/Feed --filter-pattern REPORT --start-time $1 >> billing_feed_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/ProcessStepOne --filter-pattern REPORT --start-time $1 >> billing_one_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/WordCount --filter-pattern REPORT --start-time $1 >> billing_word_$1.json
    aws logs filter-log-events --log-group-name /aws/lambda/SummingReduce --filter-pattern REPORT --start-time $1 >> billing_reduce_$1.json

}

run "$1"
