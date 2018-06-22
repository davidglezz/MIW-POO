#!/bin/bash

docker stop appschemaval
git pull
docker start appschemaval
