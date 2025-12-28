#!/bin/bash
set -e

echo "=== Updating Submodules to Latest ==="

# Update all submodules to their tracking branch
git submodule update --remote --merge

echo ""
echo "=== Current Submodule Status ==="
git submodule status

echo ""
echo "=== Update Complete ==="
echo "Run 'git diff' to see changes, then commit if desired"
