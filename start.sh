#!/bin/bash

set -eu

echo "=> Ensure directories"
mkdir -p /app/data/

echo "=> Copy EULA"
cp /app/code/eula.txt /app/data/eula.txt

echo "=> Starting management server"
node /app/code/index.js
