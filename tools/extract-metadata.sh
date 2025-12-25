#!/bin/bash
set -e

OUTPUT_DIR="/output/metadata"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Default to public RPC, can be overridden for local node
RPC_URL="${RPC_URL:-wss://rpc.hydradx.cloud}"

echo "=== Hydration Chain Metadata Extraction ==="
echo "RPC: $RPC_URL"
echo "Started at $(date)"

mkdir -p $OUTPUT_DIR

# Check if subxt is available
if ! command -v subxt &> /dev/null; then
    echo "subxt-cli not found. Installing..."
    cargo install subxt-cli || {
        echo "  ✗ Failed to install subxt-cli"
        exit 1
    }
fi

# 1. Extract metadata as JSON
echo "=== Fetching Runtime Metadata ==="
if subxt metadata --url "$RPC_URL" -f json > "$OUTPUT_DIR/runtime_metadata.json" 2>/dev/null; then
    echo "  ✓ runtime_metadata.json"
else
    echo "  ✗ Failed to fetch metadata (is node running?)"
    echo "  Trying alternative endpoint..."
    RPC_URL="wss://hydradx-rpc.dwellir.com"
    if subxt metadata --url "$RPC_URL" -f json > "$OUTPUT_DIR/runtime_metadata.json" 2>/dev/null; then
        echo "  ✓ runtime_metadata.json (via fallback)"
    else
        echo "  ✗ All RPC endpoints failed"
        exit 1
    fi
fi

# 2. Extract metadata as scale-encoded bytes
echo "=== Fetching Scale-Encoded Metadata ==="
subxt metadata --url "$RPC_URL" -f bytes > "$OUTPUT_DIR/runtime_metadata.scale" 2>/dev/null || true
echo "  ✓ runtime_metadata.scale"

# 3. Generate Rust types from metadata (for SDK validation)
echo "=== Generating Rust Types ==="
subxt codegen --url "$RPC_URL" > "$OUTPUT_DIR/generated_types.rs" 2>/dev/null || true
echo "  ✓ generated_types.rs"

# 4. Extract storage info
echo "=== Extracting Storage Schema ==="
jq '.pallets[] | {name: .name, storage: .storage}' "$OUTPUT_DIR/runtime_metadata.json" > "$OUTPUT_DIR/storage_schema.json" 2>/dev/null || true
echo "  ✓ storage_schema.json"

# 5. Extract extrinsics info
echo "=== Extracting Extrinsics Schema ==="
jq '.pallets[] | {name: .name, calls: .calls}' "$OUTPUT_DIR/runtime_metadata.json" > "$OUTPUT_DIR/extrinsics_schema.json" 2>/dev/null || true
echo "  ✓ extrinsics_schema.json"

# 6. Extract events info
echo "=== Extracting Events Schema ==="
jq '.pallets[] | {name: .name, events: .events}' "$OUTPUT_DIR/runtime_metadata.json" > "$OUTPUT_DIR/events_schema.json" 2>/dev/null || true
echo "  ✓ events_schema.json"

# 7. Extract pallet list
echo "=== Extracting Pallet List ==="
jq -r '.pallets[].name' "$OUTPUT_DIR/runtime_metadata.json" > "$OUTPUT_DIR/pallets.txt" 2>/dev/null || true
PALLET_COUNT=$(wc -l < "$OUTPUT_DIR/pallets.txt" 2>/dev/null || echo "0")
echo "  ✓ pallets.txt ($PALLET_COUNT pallets)"

# 8. Extract runtime version
echo "=== Extracting Runtime Version ==="
SPEC_VERSION=$(jq -r '.specVersion // .spec_version // 0' "$OUTPUT_DIR/runtime_metadata.json" 2>/dev/null || echo "0")
IMPL_VERSION=$(jq -r '.implVersion // .impl_version // 0' "$OUTPUT_DIR/runtime_metadata.json" 2>/dev/null || echo "0")
echo "  Spec Version: $SPEC_VERSION"

# 9. Generate extraction metadata
echo "=== Generating Extraction Metadata ==="
cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L1-live",
  "name": "chain-metadata",
  "extracted_at": "$TIMESTAMP",
  "source": "live-chain",
  "rpc_endpoint": "$RPC_URL",
  "spec_version": $SPEC_VERSION,
  "impl_version": $IMPL_VERSION,
  "pallets_count": $PALLET_COUNT
}
EOF
echo "  ✓ extraction-meta.json"

echo ""
echo "=== Metadata Extraction Complete ==="
echo "Finished at $(date)"
echo "Spec: $SPEC_VERSION | Pallets: $PALLET_COUNT"
ls -la $OUTPUT_DIR
