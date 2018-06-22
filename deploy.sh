#!/bin/bash

# docker run -it ubuntu /bin/bash
docker build --rm -t schemaval .
docker create --name appschemaval -p 8000-8003:8000-8003 -v /$(pwd):/app schemaval
docker start appschemaval
