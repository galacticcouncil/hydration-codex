#!/bin/bash
set -e

OUTPUT_DIR="/output/ui"
UI_DIR="/workspace/ui"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== Hydration UI (L4) Extraction ==="
echo "Started at $(date)"

mkdir -p $OUTPUT_DIR

cd $UI_DIR

# Get git info for versioning
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
UI_VERSION=$(grep '"version"' package.json | head -1 | cut -d'"' -f4 || echo "unknown")

# Install dependencies
echo "=== Installing Dependencies ==="
npm install || yarn install || pnpm install

# 1. Extract component structure
echo "=== Extracting Component Structure ==="
find . -name "*.tsx" -not -path "*/node_modules/*" | head -200 > "$OUTPUT_DIR/component-files.txt"
echo "  ✓ component-files.txt ($(wc -l < "$OUTPUT_DIR/component-files.txt") files)"

# 2. Extract SDK usage (api.tx.*, api.query.*)
echo "=== Extracting SDK Usage ==="
grep -rn "api\.tx\.\|api\.query\." --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules > "$OUTPUT_DIR/sdk-usage.txt" || true
echo "  ✓ sdk-usage.txt"

# 3. Extract Indexer/GraphQL usage
echo "=== Extracting Indexer Usage ==="
grep -rn "useQuery\|useLazyQuery\|gql\`\|graphql\`\|SQUID_URL\|INDEXER_URL" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules > "$OUTPUT_DIR/indexer-usage.txt" || true
echo "  ✓ indexer-usage.txt"

# 4. Extract hooks
echo "=== Extracting Custom Hooks ==="
grep -rn "^export function use\|^export const use" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules > "$OUTPUT_DIR/hooks.txt" || true
echo "  ✓ hooks.txt"

# 5. Extract routes/pages structure
echo "=== Extracting Routes ==="
find . -path "*/pages/*" -o -path "*/sections/*" -o -path "*/app/*" 2>/dev/null | grep -v node_modules | head -100 > "$OUTPUT_DIR/routes.txt" || true
echo "  ✓ routes.txt"

# 6. Extract state management
echo "=== Extracting State Management ==="
grep -rn "createStore\|createSlice\|useContext\|createContext\|zustand\|recoil\|useState\|useReducer" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -500 > "$OUTPUT_DIR/state-management.txt" || true
echo "  ✓ state-management.txt"

# 7. Extract GraphQL queries/mutations
echo "=== Extracting GraphQL Queries ==="
find . -name "*.graphql" -o -name "*.gql" 2>/dev/null | grep -v node_modules | xargs cat 2>/dev/null > "$OUTPUT_DIR/graphql-queries.txt" || true
echo "  ✓ graphql-queries.txt"

# 8. Generate extraction metadata
echo "=== Generating Extraction Metadata ==="
COMPONENT_COUNT=$(wc -l < "$OUTPUT_DIR/component-files.txt" 2>/dev/null || echo "0")
HOOK_COUNT=$(wc -l < "$OUTPUT_DIR/hooks.txt" 2>/dev/null || echo "0")
cat > "$OUTPUT_DIR/extraction-meta.json" << EOF
{
  "layer": "L4",
  "name": "ui",
  "extracted_at": "$TIMESTAMP",
  "source_repo": "hydration-ui",
  "source_branch": "$CURRENT_BRANCH",
  "source_commit": "$CURRENT_COMMIT",
  "ui_version": "$UI_VERSION",
  "components_found": $COMPONENT_COUNT,
  "hooks_found": $HOOK_COUNT
}
EOF
echo "  ✓ extraction-meta.json"

echo ""
echo "=== UI Extraction Complete ==="
echo "Finished at $(date)"
echo "Version: $UI_VERSION | Commit: $CURRENT_COMMIT"
ls -la $OUTPUT_DIR
