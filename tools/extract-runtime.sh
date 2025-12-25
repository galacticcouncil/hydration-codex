#!/bin/bash
set -e

# Configuration - can be overridden by environment
OUTPUT_DIR="${OUTPUT_DIR:-/output/runtime}"
RUNTIME_DIR="${RUNTIME_DIR:-/workspace/hydration-node}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Feature flags
EXPAND_PALLETS="${EXPAND_PALLETS:-false}"  # cargo expand is slow, disabled by default
EXTRACT_DEPS="${EXTRACT_DEPS:-true}"

echo "=== Hydration Runtime (L1) Extraction ==="
echo "Started at $(date)"
echo "Source: $RUNTIME_DIR"
echo "Output: $OUTPUT_DIR"

cd "$RUNTIME_DIR"

# Get git info for versioning
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
PREVIOUS_COMMIT=""
if [ -f "$OUTPUT_DIR/extraction-meta.json" ]; then
    PREVIOUS_COMMIT=$(jq -r '.source_commit // ""' "$OUTPUT_DIR/extraction-meta.json" 2>/dev/null || echo "")
fi

mkdir -p "$OUTPUT_DIR"/{pallets,node,runtime,evm,math,precompiles,traits,expanded}

# ===========================================
# 1. DISCOVER PALLETS DYNAMICALLY
# ===========================================
echo ""
echo "=== Discovering Pallets ==="

# Find all pallets from the pallets/ directory
PALLETS=()
if [ -d "pallets" ]; then
    for pallet_dir in pallets/*/; do
        if [ -f "${pallet_dir}Cargo.toml" ]; then
            pallet_name=$(basename "$pallet_dir")
            # Get the actual package name from Cargo.toml
            pkg_name=$(grep -m1 '^name' "${pallet_dir}Cargo.toml" | sed 's/.*"\(.*\)".*/\1/' || echo "pallet-$pallet_name")
            PALLETS+=("$pkg_name")
            echo "  Found: $pkg_name"
        fi
    done
fi

PALLET_COUNT=${#PALLETS[@]}
echo "  Total pallets discovered: $PALLET_COUNT"

# Save pallet list
printf '%s\n' "${PALLETS[@]}" > "$OUTPUT_DIR/pallets/pallet-list.txt"

# ===========================================
# 2. EXTRACT PALLET SOURCE CODE
# ===========================================
echo ""
echo "=== Extracting Pallet Source ==="

for pallet_dir in pallets/*/; do
    pallet_name=$(basename "$pallet_dir")
    pallet_out="$OUTPUT_DIR/pallets/$pallet_name"
    mkdir -p "$pallet_out"

    # Copy Cargo.toml for dependency analysis
    cp "${pallet_dir}Cargo.toml" "$pallet_out/" 2>/dev/null || true

    # Extract lib.rs (main pallet logic)
    if [ -f "${pallet_dir}src/lib.rs" ]; then
        cp "${pallet_dir}src/lib.rs" "$pallet_out/" 2>/dev/null || true
    fi

    # Extract types if exists
    if [ -f "${pallet_dir}src/types.rs" ]; then
        cp "${pallet_dir}src/types.rs" "$pallet_out/" 2>/dev/null || true
    fi

    # Extract weights
    if [ -d "${pallet_dir}src/weights" ]; then
        cp -r "${pallet_dir}src/weights" "$pallet_out/" 2>/dev/null || true
    elif [ -f "${pallet_dir}src/weights.rs" ]; then
        cp "${pallet_dir}src/weights.rs" "$pallet_out/" 2>/dev/null || true
    fi

    echo "  ✓ $pallet_name"
done

# ===========================================
# 3. EXTRACT RUNTIME CONFIGURATION
# ===========================================
echo ""
echo "=== Extracting Runtime Configuration ==="

# Main runtime lib.rs with construct_runtime!
if [ -f "runtime/hydradx/src/lib.rs" ]; then
    cp "runtime/hydradx/src/lib.rs" "$OUTPUT_DIR/runtime/"
    # Also extract just the construct_runtime! macro for quick reference
    grep -A 1000 "construct_runtime!" "runtime/hydradx/src/lib.rs" | grep -B 1000 -m 1 "^)" > "$OUTPUT_DIR/runtime/construct_runtime.txt" 2>/dev/null || true
    echo "  ✓ lib.rs (construct_runtime!)"
fi

# System configuration
if [ -f "runtime/hydradx/src/system.rs" ]; then
    cp "runtime/hydradx/src/system.rs" "$OUTPUT_DIR/runtime/"
    echo "  ✓ system.rs"
fi

# Assets configuration
if [ -f "runtime/hydradx/src/assets.rs" ]; then
    cp "runtime/hydradx/src/assets.rs" "$OUTPUT_DIR/runtime/"
    echo "  ✓ assets.rs"
fi

# XCM configuration
if [ -f "runtime/hydradx/src/xcm.rs" ]; then
    cp "runtime/hydradx/src/xcm.rs" "$OUTPUT_DIR/runtime/"
    echo "  ✓ xcm.rs"
fi

# Governance
if [ -d "runtime/hydradx/src/governance" ]; then
    cp -r "runtime/hydradx/src/governance" "$OUTPUT_DIR/runtime/"
    echo "  ✓ governance/"
fi

# Migrations
if [ -d "runtime/hydradx/src/migrations" ]; then
    cp -r "runtime/hydradx/src/migrations" "$OUTPUT_DIR/runtime/"
    echo "  ✓ migrations/"
fi

# Runtime adapters
if [ -d "runtime/adapters" ]; then
    cp -r "runtime/adapters" "$OUTPUT_DIR/runtime/"
    echo "  ✓ adapters/"
fi

# ===========================================
# 4. EXTRACT EVM CONFIGURATION
# ===========================================
echo ""
echo "=== Extracting EVM Configuration ==="

# Runtime EVM config
if [ -d "runtime/hydradx/src/evm" ]; then
    cp -r "runtime/hydradx/src/evm/"* "$OUTPUT_DIR/evm/" 2>/dev/null || true
    echo "  ✓ runtime/evm/"
fi

# EVM precompiles
if [ -d "precompiles" ]; then
    for precompile_dir in precompiles/*/; do
        precompile_name=$(basename "$precompile_dir")
        mkdir -p "$OUTPUT_DIR/precompiles/$precompile_name"
        cp "${precompile_dir}src/"*.rs "$OUTPUT_DIR/precompiles/$precompile_name/" 2>/dev/null || true
        cp "${precompile_dir}Cargo.toml" "$OUTPUT_DIR/precompiles/$precompile_name/" 2>/dev/null || true
    done
    echo "  ✓ precompiles/ ($(ls precompiles/ | wc -l) precompiles)"
fi

# EVM-related pallets
for evm_pallet in "evm-accounts" "dynamic-evm-fee"; do
    if [ -d "pallets/$evm_pallet" ]; then
        echo "  ✓ pallet-$evm_pallet (included in pallets)"
    fi
done

# ===========================================
# 5. EXTRACT NODE IMPLEMENTATION
# ===========================================
echo ""
echo "=== Extracting Node Implementation ==="

if [ -d "node/src" ]; then
    mkdir -p "$OUTPUT_DIR/node"

    # Main entry points
    cp "node/src/main.rs" "$OUTPUT_DIR/node/" 2>/dev/null || true
    cp "node/src/cli.rs" "$OUTPUT_DIR/node/" 2>/dev/null || true
    cp "node/src/chain_spec.rs" "$OUTPUT_DIR/node/" 2>/dev/null || true
    cp "node/src/command.rs" "$OUTPUT_DIR/node/" 2>/dev/null || true

    # Service (block production, networking)
    if [ -d "node/src/service" ]; then
        cp -r "node/src/service" "$OUTPUT_DIR/node/"
        echo "  ✓ service/ (block production, consensus)"
    elif [ -f "node/src/service.rs" ]; then
        cp "node/src/service.rs" "$OUTPUT_DIR/node/"
        echo "  ✓ service.rs"
    fi

    # RPC extensions
    if [ -d "node/src/rpc" ]; then
        cp -r "node/src/rpc" "$OUTPUT_DIR/node/"
        echo "  ✓ rpc/ (custom RPC methods)"
    elif [ -f "node/src/rpc.rs" ]; then
        cp "node/src/rpc.rs" "$OUTPUT_DIR/node/"
        echo "  ✓ rpc.rs"
    fi

    cp "node/Cargo.toml" "$OUTPUT_DIR/node/" 2>/dev/null || true
    echo "  ✓ node implementation extracted"
fi

# ===========================================
# 6. EXTRACT MATH LIBRARIES
# ===========================================
echo ""
echo "=== Extracting Math Libraries ==="

if [ -d "math/src" ]; then
    cp -r "math/src" "$OUTPUT_DIR/math/"
    cp "math/Cargo.toml" "$OUTPUT_DIR/math/" 2>/dev/null || true
    echo "  ✓ math/ (pool calculations, fixed-point)"
fi

# ===========================================
# 7. EXTRACT TRAITS & PRIMITIVES
# ===========================================
echo ""
echo "=== Extracting Traits & Primitives ==="

if [ -d "traits/src" ]; then
    cp -r "traits/src" "$OUTPUT_DIR/traits/"
    cp "traits/Cargo.toml" "$OUTPUT_DIR/traits/" 2>/dev/null || true
    echo "  ✓ traits/ (shared interfaces)"
fi

if [ -d "primitives" ]; then
    cp -r "primitives" "$OUTPUT_DIR/"
    echo "  ✓ primitives/ (core types)"
fi

# ===========================================
# 8. WORKSPACE CONFIGURATION
# ===========================================
echo ""
echo "=== Extracting Workspace Configuration ==="

cp "Cargo.toml" "$OUTPUT_DIR/workspace-Cargo.toml" 2>/dev/null || true
cp "Cargo.lock" "$OUTPUT_DIR/Cargo.lock" 2>/dev/null || true
echo "  ✓ workspace-Cargo.toml"

# Extract workspace members
grep -A 1000 '\[workspace\]' Cargo.toml | grep -B 1000 -m 1 '^\[' | grep '"' | sed 's/.*"\(.*\)".*/\1/' > "$OUTPUT_DIR/workspace-members.txt" 2>/dev/null || true
echo "  ✓ workspace-members.txt"

# ===========================================
# 9. DEPENDENCY ANALYSIS (optional)
# ===========================================
if [ "$EXTRACT_DEPS" = "true" ]; then
    echo ""
    echo "=== Generating Dependency Tree ==="
    if command -v cargo &> /dev/null; then
        cargo tree --prefix depth -e normal > "$OUTPUT_DIR/dependency-tree.txt" 2>/dev/null || echo "  ⚠ cargo tree failed"
        echo "  ✓ dependency-tree.txt"
    fi
fi

# ===========================================
# 10. MACRO EXPANSION (optional, slow)
# ===========================================
if [ "$EXPAND_PALLETS" = "true" ]; then
    echo ""
    echo "=== Expanding Pallet Macros (slow) ==="

    if ! command -v cargo-expand &> /dev/null; then
        echo "  Installing cargo-expand..."
        cargo install cargo-expand 2>/dev/null || true
    fi

    for pallet in "${PALLETS[@]}"; do
        echo "  Expanding $pallet..."
        if cargo expand -p "$pallet" > "$OUTPUT_DIR/expanded/${pallet}.rs" 2>/dev/null; then
            echo "    ✓ $pallet"
        else
            echo "    ✗ $pallet (skipped)"
        fi
    done
fi

# ===========================================
# 11. EXTRACT STORAGE & CALLS SUMMARY
# ===========================================
echo ""
echo "=== Generating Storage & Calls Summary ==="

# Extract all #[pallet::storage] definitions
grep -rn "#\[pallet::storage\]" pallets/ --include="*.rs" > "$OUTPUT_DIR/storage-items.txt" 2>/dev/null || true
STORAGE_COUNT=$(wc -l < "$OUTPUT_DIR/storage-items.txt" 2>/dev/null || echo "0")
echo "  ✓ storage-items.txt ($STORAGE_COUNT items)"

# Extract all #[pallet::call] extrinsics
grep -rn "pub fn " pallets/ --include="*.rs" -A 2 | grep -B 1 "DispatchResult\|DispatchResultWithPostInfo" > "$OUTPUT_DIR/extrinsics.txt" 2>/dev/null || true
echo "  ✓ extrinsics.txt"

# Extract all events
grep -rn "#\[pallet::event\]" pallets/ --include="*.rs" -A 50 | grep -E "pub enum Event|^\s+[A-Z][a-zA-Z]+ \{" > "$OUTPUT_DIR/events.txt" 2>/dev/null || true
echo "  ✓ events.txt"

# Extract all errors
grep -rn "#\[pallet::error\]" pallets/ --include="*.rs" -A 30 > "$OUTPUT_DIR/errors.txt" 2>/dev/null || true
echo "  ✓ errors.txt"

# ===========================================
# 12. CHANGE DETECTION
# ===========================================
echo ""
echo "=== Detecting Changes ==="

CHANGES_DETECTED="[]"
CHANGED_PALLETS="[]"
if [ -n "$PREVIOUS_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "$CURRENT_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "unknown" ]; then
    # Get list of changed files
    CHANGED_FILES=$(git diff --name-only "$PREVIOUS_COMMIT" "$CURRENT_COMMIT" 2>/dev/null | head -100 || echo "")
    if [ -n "$CHANGED_FILES" ]; then
        CHANGES_DETECTED=$(echo "$CHANGED_FILES" | jq -R -s 'split("\n") | map(select(length > 0))')

        # Identify which pallets changed
        CHANGED_PALLETS=$(echo "$CHANGED_FILES" | grep "^pallets/" | cut -d'/' -f2 | sort -u | jq -R -s 'split("\n") | map(select(length > 0))')

        echo "  Files changed: $(echo "$CHANGED_FILES" | wc -l)"
        echo "  Pallets affected: $(echo "$CHANGED_PALLETS" | jq 'length')"
    fi
else
    echo "  No previous extraction to compare"
fi

# ===========================================
# 13. GENERATE EXTRACTION METADATA
# ===========================================
echo ""
echo "=== Generating Extraction Metadata ==="

# Count extracted items
NODE_FILES=$(find "$OUTPUT_DIR/node" -name "*.rs" 2>/dev/null | wc -l || echo "0")
EVM_FILES=$(find "$OUTPUT_DIR/evm" -name "*.rs" 2>/dev/null | wc -l || echo "0")
PRECOMPILE_COUNT=$(ls "$OUTPUT_DIR/precompiles" 2>/dev/null | wc -l || echo "0")

cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L1",
  "name": "runtime",
  "extracted_at": "$TIMESTAMP",
  "source_repo": "hydration-node",
  "source_branch": "$CURRENT_BRANCH",
  "source_commit": "$CURRENT_COMMIT",
  "previous_commit": "$PREVIOUS_COMMIT",
  "statistics": {
    "pallets_count": $PALLET_COUNT,
    "storage_items": $STORAGE_COUNT,
    "node_files": $NODE_FILES,
    "evm_files": $EVM_FILES,
    "precompiles": $PRECOMPILE_COUNT
  },
  "components_extracted": [
    "pallets",
    "runtime",
    "node",
    "evm",
    "precompiles",
    "math",
    "traits",
    "primitives"
  ],
  "changed_files": $CHANGES_DETECTED,
  "changed_pallets": $CHANGED_PALLETS,
  "expand_enabled": $EXPAND_PALLETS
}
EOF
echo "  ✓ extraction-meta.json"

# ===========================================
# SUMMARY
# ===========================================
echo ""
echo "=== Runtime Extraction Complete ==="
echo "Finished at $(date)"
echo ""
echo "Summary:"
echo "  Commit: $CURRENT_COMMIT"
echo "  Pallets: $PALLET_COUNT"
echo "  Storage Items: $STORAGE_COUNT"
echo "  Node Files: $NODE_FILES"
echo "  EVM Files: $EVM_FILES"
echo "  Precompiles: $PRECOMPILE_COUNT"
echo ""
echo "Output: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
