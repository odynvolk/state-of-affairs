#!/bin/bash

python ./sentiment/server.py &
sleep 10 &&
deno task start --allow-read --allow-env
