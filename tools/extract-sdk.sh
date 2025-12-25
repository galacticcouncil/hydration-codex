#!/bin/bash
set -e

OUTPUT_DIR="/output/sdk"
SDK_DIR="/workspace/sdk"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== Hydration SDK (L2) Extraction ==="
echo "Started at $(date)"

mkdir -p $OUTPUT_DIR

cd $SDK_DIR

# Get git info for versioning
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
SDK_VERSION=$(grep '"version"' packages/sdk/package.json | head -1 | cut -d'"' -f4 || echo "unknown")

# Install dependencies (monorepo uses npm workspaces)
echo "=== Installing Dependencies ==="
npm install

# SDK is a monorepo with packages/:
#   - sdk (main SDK)
#   - sdk-next (next gen SDK)
#   - math-* (math libraries for pools)
#   - xcm-* (cross-chain messaging)
#   - xc-* (cross-chain utilities)

# 1. Extract all extrinsic calls (api.tx.*)
echo "=== Extracting Extrinsic Calls ==="
grep -rn "api\.tx\." --include="*.ts" packages/ > "$OUTPUT_DIR/extrinsic-calls.txt" 2>/dev/null || true
echo "  ✓ extrinsic-calls.txt ($(wc -l < "$OUTPUT_DIR/extrinsic-calls.txt") lines)"

# 2. Extract all query calls (api.query.*)
echo "=== Extracting Query Calls ==="
grep -rn "api\.query\." --include="*.ts" packages/ > "$OUTPUT_DIR/query-calls.txt" 2>/dev/null || true
echo "  ✓ query-calls.txt ($(wc -l < "$OUTPUT_DIR/query-calls.txt") lines)"

# 3. Extract type definitions
echo "=== Extracting Type Definitions ==="
grep -rn "^export type\|^export interface" --include="*.ts" packages/ > "$OUTPUT_DIR/type-definitions.txt" 2>/dev/null || true
echo "  ✓ type-definitions.txt"

# 4. Extract pool/router classes
echo "=== Extracting Pool & Router Classes ==="
grep -rn "^export class\|^export abstract class" --include="*.ts" packages/ > "$OUTPUT_DIR/classes.txt" 2>/dev/null || true
echo "  ✓ classes.txt"

# 5. Extract package structure
echo "=== Extracting Package Structure ==="
for pkg in packages/*/; do
    pkgname=$(basename "$pkg")
    if [ -f "$pkg/package.json" ]; then
        echo "$pkgname: $(cat "$pkg/package.json" | grep '"name"' | head -1)" >> "$OUTPUT_DIR/packages.txt"
    fi
done
echo "  ✓ packages.txt"

# 6. Extract math implementations (critical for understanding pool logic)
echo "=== Extracting Math Implementations ==="
find packages/math-* -name "*.ts" -exec cat {} \; > "$OUTPUT_DIR/math-implementations.ts" 2>/dev/null || true
echo "  ✓ math-implementations.ts"

# 7. Generate dependency graph for main SDK
echo "=== Generating Dependency Graph ==="
if npx madge --json packages/sdk/src > "$OUTPUT_DIR/dependency-graph.json" 2>/dev/null; then
    echo "  ✓ dependency-graph.json"
else
    echo "  ✗ madge failed (optional)"
fi

# 8. Generate extraction metadata
echo "=== Generating Extraction Metadata ==="
cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L2",
  "name": "sdk",
  "extracted_at": "$TIMESTAMP",
  "source_repo": "sdk",
  "source_branch": "$CURRENT_BRANCH",
  "source_commit": "$CURRENT_COMMIT",
  "sdk_version": "$SDK_VERSION",
  "packages": $(ls -d packages/*/ | wc -l)
}
EOF
echo "  ✓ extraction-meta.json"

echo ""
echo "=== SDK Extraction Complete ==="
echo "Finished at $(date)"
echo "Version: $SDK_VERSION | Commit: $CURRENT_COMMIT"
ls -la $OUTPUT_DIR
