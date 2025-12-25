import { describe, it, expect } from 'vitest';
import { RuntimeExtractionSchema, SDKExtractionSchema } from '../schemas/extraction.js';

describe('Extraction Schemas', () => {
  describe('RuntimeExtractionSchema', () => {
    it('validates a minimal runtime extraction', () => {
      const data = {
        meta: {
          layer: 'L1',
          name: 'runtime',
          extractedAt: new Date().toISOString(),
          source: {
            commit: 'abc123',
            branch: 'main',
            repo: 'galacticcouncil/hydration-node',
          },
        },
        pallets: [],
        runtime: {
          constructRuntime: 'construct_runtime! { ... }',
        },
        node: {
          files: [],
        },
        evm: {
          files: [],
          precompiles: [],
        },
        statistics: {
          palletsCount: 0,
          storageItems: 0,
          extrinsics: 0,
          events: 0,
          errors: 0,
        },
      };

      const result = RuntimeExtractionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates a pallet with storage and extrinsics', () => {
      const data = {
        meta: {
          layer: 'L1',
          name: 'runtime',
          extractedAt: new Date().toISOString(),
          source: {
            commit: 'abc123',
            branch: 'main',
            repo: 'galacticcouncil/hydration-node',
          },
        },
        pallets: [
          {
            name: 'omnipool',
            packageName: 'pallet-omnipool',
            path: 'pallets/omnipool',
            storage: [
              {
                pallet: 'omnipool',
                name: 'Assets',
                type: 'map',
                file: 'pallets/omnipool/src/lib.rs',
                line: 100,
              },
            ],
            extrinsics: [
              {
                pallet: 'omnipool',
                name: 'sell',
                params: [
                  { name: 'asset_in', type: 'AssetId' },
                  { name: 'asset_out', type: 'AssetId' },
                  { name: 'amount', type: 'Balance' },
                ],
                file: 'pallets/omnipool/src/lib.rs',
                line: 200,
              },
            ],
            events: [
              {
                pallet: 'omnipool',
                name: 'SellExecuted',
                fields: [],
                file: 'pallets/omnipool/src/lib.rs',
                line: 50,
              },
            ],
            errors: [],
          },
        ],
        runtime: {
          constructRuntime: 'construct_runtime! { ... }',
        },
        node: {
          files: ['node/src/main.rs'],
        },
        evm: {
          files: ['runtime/hydradx/src/evm/mod.rs'],
          precompiles: ['call-permit', 'flash-loan'],
        },
        statistics: {
          palletsCount: 1,
          storageItems: 1,
          extrinsics: 1,
          events: 1,
          errors: 0,
        },
      };

      const result = RuntimeExtractionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid layer', () => {
      const data = {
        meta: {
          layer: 'L5', // Invalid
          name: 'runtime',
          extractedAt: new Date().toISOString(),
          source: {
            commit: 'abc123',
            branch: 'main',
            repo: 'test',
          },
        },
        pallets: [],
        runtime: { constructRuntime: '' },
        node: { files: [] },
        evm: { files: [], precompiles: [] },
        statistics: {
          palletsCount: 0,
          storageItems: 0,
          extrinsics: 0,
          events: 0,
          errors: 0,
        },
      };

      const result = RuntimeExtractionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('SDKExtractionSchema', () => {
    it('validates a minimal SDK extraction', () => {
      const data = {
        meta: {
          layer: 'L2',
          name: 'sdk',
          extractedAt: new Date().toISOString(),
          source: {
            commit: 'def456',
            branch: 'main',
            repo: 'galacticcouncil/sdk',
          },
        },
        packages: [],
        apiCalls: {
          tx: [],
          query: [],
        },
        statistics: {
          packagesCount: 0,
          methodsCount: 0,
          typesCount: 0,
          txCalls: 0,
          queryCalls: 0,
        },
      };

      const result = SDKExtractionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
