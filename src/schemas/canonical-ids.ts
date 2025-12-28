/**
 * Canonical ID System
 *
 * Universal identification system for all entities across Hydration Protocol layers.
 * See: proposals/canonical-ids.md for full design documentation.
 *
 * Format: layer:type:Name[:type:Name...]
 *
 * - layer: lowercase (runtime, sdk, indexer, ui)
 * - type: lowercase (pallet, storage, call, hook, entity, etc.)
 * - Name: PRESERVED from source code (maintains original casing)
 */

// =============================================================================
// LAYERS
// =============================================================================

export const LAYERS = ['runtime', 'sdk', 'indexer', 'ui'] as const;
export type Layer = (typeof LAYERS)[number];

// =============================================================================
// ENTITY TYPES PER LAYER
// =============================================================================

/**
 * Runtime entity types (Substrate/Rust)
 *
 * Casing conventions from source:
 * - pallet: PascalCase (Omnipool, AssetRegistry)
 * - storage: PascalCase (Assets, Positions)
 * - call: snake_case (add_liquidity, swap)
 * - event: PascalCase (LiquidityAdded, Swapped)
 * - error: PascalCase (InsufficientBalance)
 * - const: PascalCase (MinTradingLimit)
 */
export const RUNTIME_TYPES = ['pallet', 'storage', 'call', 'event', 'error', 'const'] as const;
export type RuntimeType = (typeof RUNTIME_TYPES)[number];

/**
 * SDK entity types (TypeScript)
 *
 * Casing conventions from source:
 * - package: kebab-case (sdk-core, sdk-api)
 * - method: camelCase or dotted.camelCase (getPools, router.getBestSell)
 */
export const SDK_TYPES = ['package', 'method'] as const;
export type SdkType = (typeof SDK_TYPES)[number];

/**
 * Indexer entity types (Subsquid/GraphQL)
 *
 * Casing conventions from source:
 * - entity: PascalCase (OmnipoolAsset, StableswapPool)
 * - field: camelCase (assetId, hubReserve)
 * - handler: camelCase (handleSwap)
 */
export const INDEXER_TYPES = ['entity', 'field', 'handler'] as const;
export type IndexerType = (typeof INDEXER_TYPES)[number];

/**
 * UI entity types (React/TypeScript)
 *
 * Casing conventions from source:
 * - hook: camelCase with use prefix (useAddLiquidity)
 * - component: PascalCase (SwapForm)
 * - store: camelCase with use prefix (useAccountData) - Zustand, Jotai, etc.
 */
export const UI_TYPES = ['hook', 'component', 'store'] as const;
export type UiType = (typeof UI_TYPES)[number];

export type EntityType = RuntimeType | SdkType | IndexerType | UiType;

// Type to entity type mapping
export const LAYER_TYPES: Record<Layer, readonly string[]> = {
  runtime: RUNTIME_TYPES,
  sdk: SDK_TYPES,
  indexer: INDEXER_TYPES,
  ui: UI_TYPES,
};

// =============================================================================
// EDGE TYPES (Relationship semantics)
// =============================================================================

export const EDGE_TYPES = ['calls', 'queries', 'handles', 'reads', 'writes', 'uses', 'contains'] as const;
export type EdgeType = (typeof EDGE_TYPES)[number];

/**
 * Edge type semantics:
 * - calls: Submits an extrinsic (ui/sdk → runtime:call)
 * - queries: Reads storage (ui/sdk → runtime:storage)
 * - handles: Processes an event (indexer:handler → runtime:event)
 * - reads: Reads from state container (ui:hook → ui:store)
 * - writes: Writes to state container (ui:hook → ui:store)
 * - uses: Generic dependency
 * - contains: Hierarchical parent → child
 */

// =============================================================================
// CANONICAL ID STRUCTURE
// =============================================================================

export interface IdSegment {
  type: string;  // lowercase entity type
  name: string;  // preserved casing from source
}

export interface ParsedCanonicalId {
  layer: Layer;
  segments: IdSegment[];
}

export interface CanonicalEntry {
  id: string;
  layer: Layer;
  type: EntityType;
  name: string;
  parent?: string;      // Parent canonical ID
  file?: string;        // Source file (for traceability, not identification)
  line?: number;        // Source line
  metadata?: Record<string, unknown>;
}

export interface CanonicalEdge {
  from: string;         // Source canonical ID
  to: string;           // Target canonical ID
  type: EdgeType;       // Relationship type
  metadata?: Record<string, unknown>;
}

export interface CanonicalIndex {
  version: string;
  generatedAt: string;
  entries: Record<string, CanonicalEntry>;
  edges: CanonicalEdge[];
  stats: {
    entriesByLayer: Record<Layer, number>;
    edgesByType: Record<EdgeType, number>;
  };
}

// =============================================================================
// ID UTILITIES
// =============================================================================

const ID_SEPARATOR = ':';

/**
 * Parse a canonical ID string into structured form.
 *
 * @example
 * parseCanonicalId("runtime:pallet:Omnipool:call:add_liquidity")
 * // => {
 * //   layer: "runtime",
 * //   segments: [
 * //     { type: "pallet", name: "Omnipool" },
 * //     { type: "call", name: "add_liquidity" }
 * //   ]
 * // }
 */
export function parseCanonicalId(id: string): ParsedCanonicalId {
  const parts = id.split(ID_SEPARATOR);

  if (parts.length < 3 || parts.length % 2 !== 1) {
    throw new Error(`Invalid canonical ID format: ${id}. Expected layer:type:name[:type:name...]`);
  }

  const layer = parts[0] as Layer;
  if (!LAYERS.includes(layer)) {
    throw new Error(`Invalid layer: ${layer}. Expected one of: ${LAYERS.join(', ')}`);
  }

  const segments: IdSegment[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const type = parts[i];
    const name = parts[i + 1];

    if (!type || !name) {
      throw new Error(`Invalid segment at position ${i}: ${id}`);
    }

    // Validate type is lowercase
    if (type !== type.toLowerCase()) {
      throw new Error(`Entity type must be lowercase: ${type} in ${id}`);
    }

    segments.push({ type, name });
  }

  return { layer, segments };
}

/**
 * Build a canonical ID from structured form.
 *
 * @example
 * buildCanonicalId("runtime", [
 *   { type: "pallet", name: "Omnipool" },
 *   { type: "call", name: "add_liquidity" }
 * ])
 * // => "runtime:pallet:Omnipool:call:add_liquidity"
 */
export function buildCanonicalId(layer: Layer, segments: IdSegment[]): string {
  if (segments.length === 0) {
    throw new Error('At least one segment is required');
  }

  const parts: string[] = [layer];
  for (const seg of segments) {
    if (seg.type !== seg.type.toLowerCase()) {
      throw new Error(`Entity type must be lowercase: ${seg.type}`);
    }
    parts.push(seg.type, seg.name);
  }

  return parts.join(ID_SEPARATOR);
}

/**
 * Get the parent canonical ID (one level up).
 *
 * @example
 * getParentId("runtime:pallet:Omnipool:call:add_liquidity")
 * // => "runtime:pallet:Omnipool"
 *
 * getParentId("runtime:pallet:Omnipool")
 * // => null
 */
export function getParentId(id: string): string | null {
  const parsed = parseCanonicalId(id);

  if (parsed.segments.length <= 1) {
    return null;
  }

  return buildCanonicalId(parsed.layer, parsed.segments.slice(0, -1));
}

/**
 * Get the layer from a canonical ID.
 */
export function getLayer(id: string): Layer {
  const layer = id.split(ID_SEPARATOR)[0] as Layer;
  if (!LAYERS.includes(layer)) {
    throw new Error(`Invalid layer in ID: ${id}`);
  }
  return layer;
}

/**
 * Get the final entity type from a canonical ID.
 */
export function getEntityType(id: string): string {
  const parsed = parseCanonicalId(id);
  return parsed.segments[parsed.segments.length - 1].type;
}

/**
 * Get the final name from a canonical ID.
 */
export function getName(id: string): string {
  const parsed = parseCanonicalId(id);
  return parsed.segments[parsed.segments.length - 1].name;
}

/**
 * Get a display name (last segment's name, or dotted path for nested).
 */
export function getDisplayName(id: string): string {
  const parsed = parseCanonicalId(id);
  if (parsed.segments.length === 1) {
    return parsed.segments[0].name;
  }
  // For nested items, show parent.name format
  return parsed.segments.map(s => s.name).join('.');
}

/**
 * Check if an ID is a descendant of another.
 *
 * @example
 * isDescendantOf(
 *   "runtime:pallet:Omnipool:call:add_liquidity",
 *   "runtime:pallet:Omnipool"
 * ) // => true
 */
export function isDescendantOf(childId: string, parentId: string): boolean {
  return childId.startsWith(parentId + ID_SEPARATOR);
}

/**
 * Check if an ID is valid.
 */
export function isValidCanonicalId(id: string): boolean {
  try {
    parseCanonicalId(id);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// ID BUILDERS (Convenience functions for each layer)
// =============================================================================

export const runtime = {
  pallet: (name: string) =>
    buildCanonicalId('runtime', [{ type: 'pallet', name }]),

  storage: (pallet: string, storage: string) =>
    buildCanonicalId('runtime', [
      { type: 'pallet', name: pallet },
      { type: 'storage', name: storage },
    ]),

  call: (pallet: string, call: string) =>
    buildCanonicalId('runtime', [
      { type: 'pallet', name: pallet },
      { type: 'call', name: call },
    ]),

  event: (pallet: string, event: string) =>
    buildCanonicalId('runtime', [
      { type: 'pallet', name: pallet },
      { type: 'event', name: event },
    ]),

  error: (pallet: string, error: string) =>
    buildCanonicalId('runtime', [
      { type: 'pallet', name: pallet },
      { type: 'error', name: error },
    ]),

  const: (pallet: string, constant: string) =>
    buildCanonicalId('runtime', [
      { type: 'pallet', name: pallet },
      { type: 'const', name: constant },
    ]),
};

export const sdk = {
  package: (name: string) =>
    buildCanonicalId('sdk', [{ type: 'package', name }]),

  method: (pkg: string, method: string) =>
    buildCanonicalId('sdk', [
      { type: 'package', name: pkg },
      { type: 'method', name: method },
    ]),
};

export const indexer = {
  entity: (name: string) =>
    buildCanonicalId('indexer', [{ type: 'entity', name }]),

  field: (entity: string, field: string) =>
    buildCanonicalId('indexer', [
      { type: 'entity', name: entity },
      { type: 'field', name: field },
    ]),

  handler: (name: string) =>
    buildCanonicalId('indexer', [{ type: 'handler', name }]),
};

export const ui = {
  hook: (name: string) =>
    buildCanonicalId('ui', [{ type: 'hook', name }]),

  component: (name: string) =>
    buildCanonicalId('ui', [{ type: 'component', name }]),

  store: (name: string) =>
    buildCanonicalId('ui', [{ type: 'store', name }]),
};

// =============================================================================
// CONVERSION FROM LEGACY IDs
// =============================================================================

/**
 * Convert legacy ID format to canonical format.
 *
 * Legacy: "runtime:Omnipool" or "runtime:Omnipool.add_liquidity"
 * Canonical: "runtime:pallet:Omnipool" or "runtime:pallet:Omnipool:call:add_liquidity"
 */
export function fromLegacyId(legacyId: string): string {
  const [layer, ...rest] = legacyId.split(':');
  const name = rest.join(':'); // Handle cases like "runtime:Omnipool.add_liquidity"

  if (!LAYERS.includes(layer as Layer)) {
    throw new Error(`Unknown layer: ${layer}`);
  }

  switch (layer) {
    case 'runtime': {
      if (name.includes('.')) {
        const [pallet, item] = name.split('.');
        // Heuristic: snake_case = call, PascalCase = event/storage
        // For safety, default to call (most common in UI context)
        const type = item === item.toLowerCase() ? 'call' : 'storage';
        return runtime[type === 'call' ? 'call' : 'storage'](pallet, item);
      }
      return runtime.pallet(name);
    }
    case 'sdk': {
      if (name.includes('.')) {
        const [pkg, method] = name.split('.');
        return sdk.method(pkg, method);
      }
      return sdk.package(name);
    }
    case 'indexer':
      return indexer.entity(name);
    case 'ui':
      return ui.hook(name);
    default:
      throw new Error(`Cannot convert legacy ID: ${legacyId}`);
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that a type is valid for a layer.
 */
export function isValidTypeForLayer(layer: Layer, type: string): boolean {
  return (LAYER_TYPES[layer] as readonly string[]).includes(type);
}

/**
 * Validate a canonical entry.
 */
export function validateEntry(entry: CanonicalEntry): string[] {
  const errors: string[] = [];

  // Validate ID format
  try {
    const parsed = parseCanonicalId(entry.id);

    // Layer must match
    if (parsed.layer !== entry.layer) {
      errors.push(`Layer mismatch: ID has ${parsed.layer}, entry has ${entry.layer}`);
    }

    // Type must match last segment
    const lastType = parsed.segments[parsed.segments.length - 1].type;
    if (lastType !== entry.type) {
      errors.push(`Type mismatch: ID has ${lastType}, entry has ${entry.type}`);
    }

    // Type must be valid for layer
    if (!isValidTypeForLayer(entry.layer, entry.type)) {
      errors.push(`Invalid type ${entry.type} for layer ${entry.layer}`);
    }
  } catch (e) {
    errors.push(`Invalid ID: ${(e as Error).message}`);
  }

  // Validate parent if present
  if (entry.parent) {
    const expectedParent = getParentId(entry.id);
    if (entry.parent !== expectedParent) {
      errors.push(`Parent mismatch: expected ${expectedParent}, got ${entry.parent}`);
    }
  }

  return errors;
}
