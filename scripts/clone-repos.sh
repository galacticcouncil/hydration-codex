#!/bin/bash
set -e

REPOS_DIR="$(dirname "$0")/../repos"
mkdir -p "$REPOS_DIR"
cd "$REPOS_DIR"

echo "=== Cloning Hydration Ecosystem Repositories ==="

# L1: Core runtime (main branch)
if [ ! -d "hydration-node" ]; then
    echo "[L1] Cloning hydration-node..."
    git clone --depth 1 https://github.com/galacticcouncil/hydration-node.git
else
    echo "[L1] hydration-node already exists, pulling latest..."
    cd hydration-node && git pull && cd ..
fi

# L2: TypeScript SDK (main branch)
if [ ! -d "sdk" ]; then
    echo "[L2] Cloning SDK..."
    git clone --depth 1 https://github.com/galacticcouncil/sdk.git
else
    echo "[L2] sdk already exists, pulling latest..."
    cd sdk && git pull && cd ..
fi

# L3: Indexer (develop branch)
if [ ! -d "indexer" ]; then
    echo "[L3] Cloning hydration-data-lake (branch: develop)..."
    git clone --depth 1 --branch develop https://github.com/galacticcouncil/hydration-data-lake.git indexer
else
    echo "[L3] indexer already exists, pulling latest..."
    cd indexer && git checkout develop && git pull && cd ..
fi

# L4: Frontend UI (next branch)
if [ ! -d "hydration-ui" ]; then
    echo "[L4] Cloning hydration-ui (branch: next)..."
    git clone --depth 1 --branch next https://github.com/galacticcouncil/hydration-ui.git
else
    echo "[L4] hydration-ui already exists, pulling latest..."
    cd hydration-ui && git checkout next && git pull && cd ..
fi

# Bridge: WASM math bindings (generated from L1, used by L2)
if [ ! -d "hydration-wasm" ]; then
    echo "[L1→L2] Cloning hydration-wasm (generated WASM bindings)..."
    git clone --depth 1 https://github.com/galacticcouncil/hydration-wasm.git
else
    echo "[L1→L2] hydration-wasm already exists, pulling latest..."
    cd hydration-wasm && git pull && cd ..
fi

echo ""
echo "=== All repositories cloned ==="
echo ""
echo "Architecture:"
echo "  L1: hydration-node (runtime, pallets, math)"
echo "       ├── hydration-wasm (generated WASM for client-side math)"
echo "       └── chain metadata (types)"
echo "  L2: sdk (uses wasm + metadata)"
echo "  L3: indexer (uses SDK + direct chain)"
echo "  L4: hydration-ui (uses SDK + Indexer)"
echo ""
ls -la
