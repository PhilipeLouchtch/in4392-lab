#!/bin/bash

if [[ "$1" = "" || "$2" = "" ]]
then
  echo "Usage: $0 <path/to/dist/directory> <function name>"
  exit
fi

# $1: Path to distro folder
# $2: Function name
cd $1 # required, otherwise folders /dist/test will end up in .zip
zip -X -r ./deployment.zip *    
aws lambda update-function-code --function-name $2 --zip-file fileb://deployment.zip
rm deployment.zip
