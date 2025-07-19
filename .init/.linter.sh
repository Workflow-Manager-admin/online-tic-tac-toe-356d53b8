#!/bin/bash
cd /home/kavia/workspace/code-generation/online-tic-tac-toe-356d53b8/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

