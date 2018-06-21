#!/bin/bash

# docker run -it ubuntu /bin/bash
docker build --rm -t schemaval .
docker create --name appschemaval -p 8000-8003:8000-8003 schemaval
docker start appschemaval
