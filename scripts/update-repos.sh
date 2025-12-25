#!/bin/bash
set -e

REPOS_DIR="$(dirname "$0")/../repos"
cd "$REPOS_DIR"

echo "=== Updating All Repositories ==="

for dir in hydration-node sdk hydration-ui squid; do
    if [ -d "$dir" ]; then
        echo "Updating $dir..."
        cd "$dir"
        git fetch origin
        git pull origin main || git pull origin master || echo "  Warning: could not pull $dir"
        cd ..
    else
        echo "  $dir not found, skipping"
    fi
done

echo ""
echo "=== Update Complete ==="
