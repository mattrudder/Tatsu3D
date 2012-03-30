#!/bin/sh

sprocketize --include-dir=src --asset-root=build src/tatsu.js > build/tatsu.js
java -jar vendor/yuicompressor-2.4.6.jar build/tatsu.js > build/tatsu-min.js