#!/bin/bash

set -eu

echo "=> Ensure directories"
mkdir -p /app/data/

echo "=> Accept EULA"
echo "eula=true" > /app/data/eula.txt

echo "=> Starting management server"
node /app/code/index.js
