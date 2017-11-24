#!/bin/bash

browserify -t [ babelify --presets [ es2015 react ] ] ./main.js -o ./bundle.js
browserify -t [ babelify --presets [ es2015 react ] ] ./references.js -o ./bundle_references.js
#browserify -t [ babelify] ./main.js -o ./bundle.js
