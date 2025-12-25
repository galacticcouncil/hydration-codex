#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TOOLS_DIR="$PROJECT_ROOT/tools"
OUTPUT_DIR="$PROJECT_ROOT/knowledge-base/raw"

echo "=== Running Full Ecosystem Extraction ==="
echo "Project Root: $PROJECT_ROOT"
echo "Started at $(date)"

mkdir -p "$OUTPUT_DIR"/{runtime,sdk,indexer,ui,metadata}

# Determine if we're running in Docker or locally
USE_DOCKER="${USE_DOCKER:-false}"

if [ "$USE_DOCKER" = "true" ]; then
    echo "Running extractions in Docker containers..."

    # Run runtime extraction (L1)
    echo ""
    echo ">>> L1: RUNTIME EXTRACTION <<<"
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" run --rm rust-env \
        bash /tools/extract-runtime.sh

    # Run SDK extraction (L2)
    echo ""
    echo ">>> L2: SDK EXTRACTION <<<"
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" run --rm node-env \
        bash /tools/extract-sdk.sh

    # Run Indexer extraction (L3)
    echo ""
    echo ">>> L3: INDEXER EXTRACTION <<<"
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" run --rm node-env \
        bash /tools/extract-indexer.sh

    # Run UI extraction (L4)
    echo ""
    echo ">>> L4: UI EXTRACTION <<<"
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" run --rm node-env \
        bash /tools/extract-ui.sh

    # Optional: Run live metadata extraction
    if [ "${EXTRACT_METADATA:-false}" = "true" ]; then
        echo ""
        echo ">>> LIVE METADATA EXTRACTION <<<"
        docker compose -f "$PROJECT_ROOT/docker-compose.yml" run --rm rust-env \
            bash /tools/extract-metadata.sh
    fi
else
    echo "Running extractions locally..."

    # Export paths for scripts
    export OUTPUT_DIR

    # Run runtime extraction (L1)
    echo ""
    echo ">>> L1: RUNTIME EXTRACTION <<<"
    if [ -d "$PROJECT_ROOT/repos/hydration-node" ]; then
        cd "$PROJECT_ROOT/repos/hydration-node"
        OUTPUT_DIR="$OUTPUT_DIR/runtime" bash "$TOOLS_DIR/extract-runtime.sh" || echo "  ⚠ Runtime extraction had issues"
    else
        echo "  ✗ hydration-node repo not found, skipping"
    fi

    # Run SDK extraction (L2)
    echo ""
    echo ">>> L2: SDK EXTRACTION <<<"
    if [ -d "$PROJECT_ROOT/repos/sdk" ]; then
        cd "$PROJECT_ROOT/repos/sdk"
        OUTPUT_DIR="$OUTPUT_DIR/sdk" bash "$TOOLS_DIR/extract-sdk.sh" || echo "  ⚠ SDK extraction had issues"
    else
        echo "  ✗ SDK repo not found, skipping"
    fi

    # Run Indexer extraction (L3)
    echo ""
    echo ">>> L3: INDEXER EXTRACTION <<<"
    if [ -d "$PROJECT_ROOT/repos/indexer" ]; then
        cd "$PROJECT_ROOT/repos/indexer"
        OUTPUT_DIR="$OUTPUT_DIR/indexer" bash "$TOOLS_DIR/extract-indexer.sh" || echo "  ⚠ Indexer extraction had issues"
    else
        echo "  ✗ Indexer repo not found, skipping"
    fi

    # Run UI extraction (L4)
    echo ""
    echo ">>> L4: UI EXTRACTION <<<"
    if [ -d "$PROJECT_ROOT/repos/hydration-ui" ]; then
        cd "$PROJECT_ROOT/repos/hydration-ui"
        OUTPUT_DIR="$OUTPUT_DIR/ui" bash "$TOOLS_DIR/extract-ui.sh" || echo "  ⚠ UI extraction had issues"
    else
        echo "  ✗ UI repo not found, skipping"
    fi

    # Optional: Run live metadata extraction
    if [ "${EXTRACT_METADATA:-true}" = "true" ]; then
        echo ""
        echo ">>> LIVE METADATA EXTRACTION <<<"
        OUTPUT_DIR="$OUTPUT_DIR/metadata" bash "$TOOLS_DIR/extract-metadata.sh" || echo "  ⚠ Metadata extraction had issues"
    fi

    # L1→L2 Bridge: WASM math bindings (generated)
    echo ""
    echo ">>> WASM BRIDGE EXTRACTION (L1→L2) <<<"
    if [ -d "$PROJECT_ROOT/repos/hydration-wasm" ]; then
        WASM_DIR="$PROJECT_ROOT/repos/hydration-wasm" \
        OUTPUT_DIR="$OUTPUT_DIR/wasm-bridge" \
        bash "$TOOLS_DIR/extract-wasm-bridge.sh" || echo "  ⚠ WASM bridge extraction had issues"
    else
        echo "  ✗ hydration-wasm repo not found, skipping"
    fi
fi

# Update extraction timestamp
echo ""
echo "=== Updating Extraction Log ==="
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
LOG_FILE="$PROJECT_ROOT/knowledge-base/history/extraction-log.txt"
mkdir -p "$(dirname "$LOG_FILE")"
echo "[$TIMESTAMP] Full extraction completed" >> "$LOG_FILE"

echo ""
echo "=== Full Extraction Complete ==="
echo "Finished at $(date)"
echo "Output: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR" 2>/dev/null || true
