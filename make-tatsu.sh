#!/bin/sh

sprocketize -i=src -a=build src/tatsu.js > build/tatsu.js
java -jar vendor/yuicompressor-2.4.6.jar build/tatsu.js > build/tatsu-min.js