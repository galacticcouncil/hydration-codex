import { z } from 'zod';

// ===========================================
// Common Types
// ===========================================

export const GitInfoSchema = z.object({
  commit: z.string(),
  branch: z.string(),
  repo: z.string(),
});

export const ExtractionMetaSchema = z.object({
  layer: z.enum(['L1', 'L2', 'L3', 'L4', 'L1-L2-bridge']),
  name: z.string(),
  extractedAt: z.string().datetime(),
  source: GitInfoSchema,
  previousCommit: z.string().optional(),
});

// ===========================================
// L1: Runtime Extraction
// ===========================================

export const StorageItemSchema = z.object({
  pallet: z.string(),
  name: z.string(),
  type: z.string(),
  docs: z.string().optional(),
  file: z.string(),
  line: z.number(),
});

export const ExtrinsicSchema = z.object({
  pallet: z.string(),
  name: z.string(),
  params: z.array(z.object({
    name: z.string(),
    type: z.string(),
  })),
  docs: z.string().optional(),
  file: z.string(),
  line: z.number(),
});

export const EventSchema = z.object({
  pallet: z.string(),
  name: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
  })),
  file: z.string(),
  line: z.number(),
});

export const ErrorSchema = z.object({
  pallet: z.string(),
  name: z.string(),
  docs: z.string().optional(),
  file: z.string(),
  line: z.number(),
});

export const PalletSchema = z.object({
  name: z.string(),
  packageName: z.string(),
  path: z.string(),
  storage: z.array(StorageItemSchema),
  extrinsics: z.array(ExtrinsicSchema),
  events: z.array(EventSchema),
  errors: z.array(ErrorSchema),
});

export const RuntimeExtractionSchema = z.object({
  meta: ExtractionMetaSchema,
  pallets: z.array(PalletSchema),
  runtime: z.object({
    specVersion: z.number().optional(),
    implVersion: z.number().optional(),
    constructRuntime: z.string(),
  }),
  node: z.object({
    files: z.array(z.string()),
    rpcMethods: z.array(z.string()).optional(),
  }),
  evm: z.object({
    precompiles: z.array(z.string()),
    files: z.array(z.string()),
  }),
  statistics: z.object({
    palletsCount: z.number(),
    storageItems: z.number(),
    extrinsics: z.number(),
    events: z.number(),
    errors: z.number(),
  }),
  changedFiles: z.array(z.string()).optional(),
  changedPallets: z.array(z.string()).optional(),
});

// ===========================================
// L2: SDK Extraction
// ===========================================

export const SDKMethodSchema = z.object({
  className: z.string(),
  methodName: z.string(),
  params: z.array(z.object({
    name: z.string(),
    type: z.string(),
  })),
  returnType: z.string(),
  file: z.string(),
  line: z.number(),
  usesApi: z.object({
    tx: z.array(z.string()),
    query: z.array(z.string()),
  }).optional(),
});

export const SDKTypeSchema = z.object({
  name: z.string(),
  kind: z.enum(['type', 'interface', 'enum', 'class']),
  file: z.string(),
  line: z.number(),
  exported: z.boolean(),
});

export const SDKPackageSchema = z.object({
  name: z.string(),
  version: z.string(),
  path: z.string(),
  methods: z.array(SDKMethodSchema),
  types: z.array(SDKTypeSchema),
});

export const SDKExtractionSchema = z.object({
  meta: ExtractionMetaSchema,
  packages: z.array(SDKPackageSchema),
  apiCalls: z.object({
    tx: z.array(z.object({
      call: z.string(),
      file: z.string(),
      line: z.number(),
    })),
    query: z.array(z.object({
      call: z.string(),
      file: z.string(),
      line: z.number(),
    })),
  }),
  statistics: z.object({
    packagesCount: z.number(),
    methodsCount: z.number(),
    typesCount: z.number(),
    txCalls: z.number(),
    queryCalls: z.number(),
  }),
});

// ===========================================
// L3: Indexer Extraction
// ===========================================

export const GraphQLEntitySchema = z.object({
  name: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    nullable: z.boolean(),
  })),
});

export const EventHandlerSchema = z.object({
  event: z.string(),
  handler: z.string(),
  file: z.string(),
  line: z.number(),
  createsEntities: z.array(z.string()),
});

export const IndexerExtractionSchema = z.object({
  meta: ExtractionMetaSchema,
  schema: z.object({
    entities: z.array(GraphQLEntitySchema),
    queries: z.array(z.string()),
  }),
  handlers: z.array(EventHandlerSchema),
  endpoints: z.object({
    production: z.string(),
    testnet: z.string().optional(),
  }),
  statistics: z.object({
    entitiesCount: z.number(),
    handlersCount: z.number(),
  }),
});

// ===========================================
// L4: UI Extraction
// ===========================================

export const ComponentSchema = z.object({
  name: z.string(),
  file: z.string(),
  props: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
  })).optional(),
});

export const HookSchema = z.object({
  name: z.string(),
  file: z.string(),
  line: z.number(),
  usesSDK: z.boolean(),
  usesIndexer: z.boolean(),
});

export const UIExtractionSchema = z.object({
  meta: ExtractionMetaSchema,
  components: z.array(ComponentSchema),
  hooks: z.array(HookSchema),
  sdkUsage: z.array(z.object({
    call: z.string(),
    file: z.string(),
    line: z.number(),
  })),
  indexerUsage: z.array(z.object({
    query: z.string(),
    file: z.string(),
    line: z.number(),
  })),
  statistics: z.object({
    componentsCount: z.number(),
    hooksCount: z.number(),
    sdkCalls: z.number(),
    indexerQueries: z.number(),
  }),
});

// ===========================================
// WASM Bridge Extraction
// ===========================================

export const WASMExportSchema = z.object({
  name: z.string(),
  params: z.array(z.string()),
  returnType: z.string(),
  file: z.string(),
  line: z.number(),
});

export const WASMBridgeExtractionSchema = z.object({
  meta: ExtractionMetaSchema,
  versions: z.object({
    npm: z.string(),
    rust: z.string(),
  }),
  exports: z.array(WASMExportSchema),
  modules: z.array(z.string()),
  statistics: z.object({
    exportsCount: z.number(),
    modulesCount: z.number(),
  }),
});

// ===========================================
// Combined Extraction Result
// ===========================================

export const FullExtractionSchema = z.object({
  extractedAt: z.string().datetime(),
  runtime: RuntimeExtractionSchema,
  sdk: SDKExtractionSchema,
  indexer: IndexerExtractionSchema,
  ui: UIExtractionSchema,
  wasmBridge: WASMBridgeExtractionSchema.optional(),
});

// Type exports
export type GitInfo = z.infer<typeof GitInfoSchema>;
export type ExtractionMeta = z.infer<typeof ExtractionMetaSchema>;
export type StorageItem = z.infer<typeof StorageItemSchema>;
export type Extrinsic = z.infer<typeof ExtrinsicSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Pallet = z.infer<typeof PalletSchema>;
export type RuntimeExtraction = z.infer<typeof RuntimeExtractionSchema>;
export type SDKMethod = z.infer<typeof SDKMethodSchema>;
export type SDKType = z.infer<typeof SDKTypeSchema>;
export type SDKPackage = z.infer<typeof SDKPackageSchema>;
export type SDKExtraction = z.infer<typeof SDKExtractionSchema>;
export type GraphQLEntity = z.infer<typeof GraphQLEntitySchema>;
export type EventHandler = z.infer<typeof EventHandlerSchema>;
export type IndexerExtraction = z.infer<typeof IndexerExtractionSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type Hook = z.infer<typeof HookSchema>;
export type UIExtraction = z.infer<typeof UIExtractionSchema>;
export type WASMExport = z.infer<typeof WASMExportSchema>;
export type WASMBridgeExtraction = z.infer<typeof WASMBridgeExtractionSchema>;
export type FullExtraction = z.infer<typeof FullExtractionSchema>;
