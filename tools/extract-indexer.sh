#!/bin/bash
set -e

OUTPUT_DIR="/output/indexer"
INDEXER_DIR="/workspace/indexer"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== Hydration Indexer (L3) Extraction ==="
echo "Started at $(date)"

mkdir -p $OUTPUT_DIR

cd $INDEXER_DIR

# Get git info for versioning
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Main indexer is in indexers/liquidity-pools
POOLS_DIR="indexers/liquidity-pools"

# 1. Extract GraphQL schema
echo "=== Extracting GraphQL Schema ==="
if [ -f "$POOLS_DIR/schema.graphql" ]; then
    cp "$POOLS_DIR/schema.graphql" "$OUTPUT_DIR/schema.graphql"
    echo "  ✓ schema.graphql ($(wc -l < "$OUTPUT_DIR/schema.graphql") lines)"
fi

# 2. Extract event handlers
echo "=== Extracting Event Handlers ==="
if [ -d "$POOLS_DIR/src/handlers" ]; then
    find "$POOLS_DIR/src/handlers" -name "*.ts" -exec cat {} \; > "$OUTPUT_DIR/handlers.ts" 2>/dev/null
    echo "  ✓ handlers.ts"
fi

# 3. Extract entity/model definitions
echo "=== Extracting Entity Definitions ==="
if [ -d "$POOLS_DIR/src/model" ]; then
    find "$POOLS_DIR/src/model" -name "*.ts" -exec cat {} \; > "$OUTPUT_DIR/entities.ts" 2>/dev/null
    echo "  ✓ entities.ts"
fi

# 4. Extract parsers (event data parsing)
echo "=== Extracting Parsers ==="
if [ -d "$POOLS_DIR/src/parsers" ]; then
    find "$POOLS_DIR/src/parsers" -name "*.ts" -exec cat {} \; > "$OUTPUT_DIR/parsers.ts" 2>/dev/null
    echo "  ✓ parsers.ts"
fi

# 5. Extract processor configuration
echo "=== Extracting Processor Config ==="
if [ -f "$POOLS_DIR/src/processor.ts" ]; then
    cp "$POOLS_DIR/src/processor.ts" "$OUTPUT_DIR/processor.ts"
    echo "  ✓ processor.ts"
fi

# 6. Map events to runtime pallets
echo "=== Mapping Events to Runtime ==="
grep -rn "Omnipool\|Stableswap\|DCA\|LBP\|XYK\|Balances\|Tokens" \
    --include="*.ts" "$POOLS_DIR/src" 2>/dev/null \
    | grep -v node_modules > "$OUTPUT_DIR/runtime-event-mappings.txt" || true
echo "  ✓ runtime-event-mappings.txt"

# 7. Extract type definitions
echo "=== Extracting Type Definitions ==="
grep -rn "^export type\|^export interface\|^export enum" \
    --include="*.ts" "$POOLS_DIR/src" 2>/dev/null \
    > "$OUTPUT_DIR/type-definitions.txt" || true
echo "  ✓ type-definitions.txt"

# 8. Document endpoints
echo "=== Documenting Endpoints ==="
cat > "$OUTPUT_DIR/endpoints.md" << 'EOF'
# Hydration Indexer Endpoints

## Production (Mainnet)
- **URL:** https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql
- **Purpose:** Pool stats, trade history, aggregations for UI

## Block Explorer
- **URL:** https://explorer.hydradx.cloud/graphql
- **Purpose:** Block/extrinsic/event queries

## Testnet (Paseo)
- **URL:** https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql
EOF
echo "  ✓ endpoints.md"

# 9. Generate extraction metadata
echo "=== Generating Extraction Metadata ==="
SCHEMA_ENTITIES=$(grep -c "^type [A-Z]" "$OUTPUT_DIR/schema.graphql" 2>/dev/null || echo "0")
cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L3",
  "name": "indexer",
  "extracted_at": "$TIMESTAMP",
  "source_repo": "hydration-data-lake",
  "source_branch": "$CURRENT_BRANCH",
  "source_commit": "$CURRENT_COMMIT",
  "schema_entities": $SCHEMA_ENTITIES,
  "endpoints": {
    "production": "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
    "testnet": "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql"
  }
}
EOF
echo "  ✓ extraction-meta.json"

echo ""
echo "=== Indexer Extraction Complete ==="
echo "Finished at $(date)"
echo "Commit: $CURRENT_COMMIT | Entities: $SCHEMA_ENTITIES"
ls -la $OUTPUT_DIR
