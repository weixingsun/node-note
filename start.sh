#!/bin/bash
if [ $# != 3 ] ; then 
  echo "Start format: ./start.sh [name] [condition] [UUID]" >&2 ; 
  exit 1 ; 
fi
uuid=$1
name=$2
cond=$3
#echo "uuid=$uuid name=$name cond=$cond "
node index.js $uuid $name $cond > console.log
