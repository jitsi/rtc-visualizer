#!/bin/bash
set -e

echo "Linting..."
npm run lint

echo "Removing public dir.."
rm -rf public

echo "Building production client..."
npm run build-client

echo "Increasing version..."
npm version patch


