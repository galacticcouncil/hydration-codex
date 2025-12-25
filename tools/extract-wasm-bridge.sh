#!/bin/bash
set -e

# hydration-wasm is GENERATED code - we track for version alignment, not deep extraction

OUTPUT_DIR="${OUTPUT_DIR:-/output/wasm-bridge}"
WASM_DIR="${WASM_DIR:-/workspace/hydration-wasm}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== Hydration WASM Bridge (L1→L2) Extraction ==="
echo "Purpose: Track version alignment between Rust math and SDK"
echo "Started at $(date)"

mkdir -p "$OUTPUT_DIR"

cd "$WASM_DIR"

# Get git info
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# 1. Extract package info
echo "=== Extracting Package Info ==="
if [ -f "package.json" ]; then
    cp "package.json" "$OUTPUT_DIR/"
    NPM_VERSION=$(jq -r '.version // "unknown"' package.json)
    NPM_NAME=$(jq -r '.name // "unknown"' package.json)
    echo "  ✓ package.json (${NPM_NAME}@${NPM_VERSION})"
fi

# 2. Extract Cargo.toml (Rust source info)
echo "=== Extracting Rust Source Info ==="
if [ -f "Cargo.toml" ]; then
    cp "Cargo.toml" "$OUTPUT_DIR/"
    RUST_VERSION=$(grep -m1 '^version' Cargo.toml | sed 's/.*"\(.*\)".*/\1/' || echo "unknown")
    echo "  ✓ Cargo.toml (v${RUST_VERSION})"
fi

# 3. Extract exported functions (what SDK can call)
echo "=== Extracting WASM Exports ==="
if [ -d "src" ]; then
    # Find all #[wasm_bindgen] exports
    grep -rn "#\[wasm_bindgen\]" src/ --include="*.rs" -A 3 > "$OUTPUT_DIR/wasm-exports.txt" 2>/dev/null || true
    EXPORT_COUNT=$(grep -c "pub fn" "$OUTPUT_DIR/wasm-exports.txt" 2>/dev/null || echo "0")
    echo "  ✓ wasm-exports.txt ($EXPORT_COUNT functions)"
fi

# 4. Extract TypeScript type definitions
echo "=== Extracting TypeScript Types ==="
if [ -f "pkg/hydration_wasm.d.ts" ]; then
    cp "pkg/hydration_wasm.d.ts" "$OUTPUT_DIR/types.d.ts"
    echo "  ✓ types.d.ts"
elif [ -f "types/hydration_wasm.d.ts" ]; then
    cp "types/hydration_wasm.d.ts" "$OUTPUT_DIR/types.d.ts"
    echo "  ✓ types.d.ts"
fi

# 5. Check hydration-node math dependency
echo "=== Checking Source Dependency ==="
MATH_DEP="unknown"
if [ -f "Cargo.toml" ]; then
    # Look for hydradx-math or similar dependency
    MATH_DEP=$(grep -E "hydra.*math|math.*hydra" Cargo.toml | head -1 || echo "inline")
    echo "  Math source: $MATH_DEP"
fi

# 6. Generate extraction metadata
echo "=== Generating Extraction Metadata ==="
cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L1-L2-bridge",
  "name": "hydration-wasm",
  "type": "generated",
  "extracted_at": "$TIMESTAMP",
  "source_repo": "hydration-wasm",
  "source_branch": "$CURRENT_BRANCH",
  "source_commit": "$CURRENT_COMMIT",
  "versions": {
    "npm": "${NPM_VERSION:-unknown}",
    "rust": "${RUST_VERSION:-unknown}"
  },
  "exports_count": ${EXPORT_COUNT:-0},
  "purpose": "Compiles Rust math functions to WASM for SDK client-side calculations",
  "upstream": "hydration-node/math",
  "downstream": "@galacticcouncil/sdk"
}
EOF
echo "  ✓ extraction-meta.json"

echo ""
echo "=== WASM Bridge Extraction Complete ==="
echo "Finished at $(date)"
echo ""
echo "Version Alignment Check:"
echo "  NPM Package: ${NPM_NAME:-unknown}@${NPM_VERSION:-unknown}"
echo "  Rust Crate: ${RUST_VERSION:-unknown}"
echo "  WASM Exports: ${EXPORT_COUNT:-0} functions"
echo ""
echo "Output: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
