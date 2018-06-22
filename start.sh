#!/bin/bash

cd /app/cliente && php -S 0.0.0.0:8000 & 
cd /app/php/public && php -S 0.0.0.0:8001 &
cd /app/nodejs && npm start &
cd /app/python && python3 main.py &
wait
