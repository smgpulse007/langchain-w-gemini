#!/bin/sh
source .venv/bin/activate

if [ -z "$PORT" ]; then
  export PORT=9002
fi
python -m flask --app main run --debug --port=$PORT