#!/bin/bash

# script to generate optimized client build for Wirlds

BUILDDIR="clientbuild"
PROJECTDIR="client/js"
CURDIR=$(pwd)

if [ "$1" == "clean" ]; then
exit
fi

echo "Building client with RequireJS"
cd $PROJECTDIR
node ../../r.js -o build.js
cd $CURDIR

echo "Moving build.txt to current dir"
mv $BUILDDIR/build.txt $CURDIR

echo "Build complete"

