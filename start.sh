#!/bin/bash
if [ $# != 1 ] ; then echo "Start format: ./start.sh [UUID]" >&2 ; exit 1 ; fi
uuid=$1
node index.js $uuid > console.log
