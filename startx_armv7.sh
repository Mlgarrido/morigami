#!/bin/bash

cd "$(dirname "$0")/dist/armv7l/Morigami-linux-armv7l"

startx ./start.sh
sleep 10
unclutter -display :0 -noevents -grab
