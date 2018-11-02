#!/bin/bash

function run () {

  if [[ "$1" = "" ]]
  then
    echo "Usage: $0 <function name>"
    return 1
  fi

  if ! [[ -d "./dist/$1" ]] 
  then
    echo "Folder does not exist: ./dist/$1"
    return 1
  fi

  # $1: Path to distro folder
  # $2: Function name
  cd ./dist/$1 # required, otherwise folders /dist/test will end up in .zip
  zip -X -r ./$1.zip *
  aws s3 cp ./$1.zip s3:///lamdbas-fns/$1.zip
  # aws lambda update-function-code --function-name $1 --zip-file fileb://$1.zip
  rm $1.zip
}

run "$1"
