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
  zip -X -r ./deployment.zip *    
  aws lambda update-function-code --function-name $2 --zip-file fileb://deployment.zip
  rm deployment.zip

}

run "$1"
