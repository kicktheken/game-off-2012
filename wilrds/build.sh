#!/bin/bash

# script to generate optimized client build for Wirlds

CURDIR=$(pwd)
DIR=`dirname ${BASH_SOURCE[0]}`
BUILDDIR="$DIR/clientbuild"
PROJECTDIR="$DIR/client/js"

if [ "$1" == "clean" ]; then
    set -x
    rm -rf $BUILDDIR
    exit
fi

echo "Building client with RequireJS"
cd $PROJECTDIR
node ../../r.js -o build.js
cd $CURDIR

echo "Moving build.txt to current dir"
mv $BUILDDIR/build.txt $DIR

echo "Build complete"

