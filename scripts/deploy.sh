#!/bin/bash
set -e

SHOULD_PUSH_IMAGE=$1
NAME=rtc-visualizer

if [[ -z "$REPOSITORY_URL" ]]; then
  echo "No repository url to push to specified, exiting."
  echo "please specify the REPOSITORY_URL env variable."
  exit 1
fi

if [[ -z "$SHOULD_PUSH_IMAGE" ]]; then
  echo "No instruction to push or not to push specified, exiting."
  echo "please use: ./deploy.sh true/false dev/prod version"
  exit 1
fi

VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')


REPOSITORY=${REPOSITORY_URL}:${VERSION}

echo Building tag image $REPOSITORY

docker build --platform linux/amd64 -t $REPOSITORY .

if [[ ${SHOULD_PUSH_IMAGE} == true ]]
  then
    echo "push dockerimage to ecr $REPOSITORY"
    aws ecr get-login-password | docker login --username AWS --password-stdin $REPOSITORY_URL
    docker push $REPOSITORY
fi
