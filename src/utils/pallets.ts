/**
 * Pallet Name Utilities
 *
 * Provides consistent pallet name normalization across all synthesizers.
 * Pallet pages use PascalCase names (e.g., "AssetRegistry", "Router").
 */

/**
 * Known pallet name mappings for special cases.
 * Maps lowercase/variant names to their canonical PascalCase form.
 */
const PALLET_NAME_MAP: Record<string, string> = {
  // Standard pallets with simple capitalization
  'router': 'Router',
  'scheduler': 'Scheduler',
  'staking': 'Staking',
  'system': 'System',
  'balances': 'Balances',
  'tokens': 'Tokens',
  'utility': 'Utility',
  'timestamp': 'Timestamp',
  'treasury': 'Treasury',
  'democracy': 'Democracy',
  'council': 'Council',
  'elections': 'Elections',
  'identity': 'Identity',
  'proxy': 'Proxy',
  'multisig': 'Multisig',
  'vesting': 'Vesting',
  'preimage': 'Preimage',
  'referenda': 'Referenda',
  'whitelist': 'Whitelist',
  'sudo': 'Sudo',

  // DeFi pallets
  'omnipool': 'Omnipool',
  'stableswap': 'Stableswap',
  'xyk': 'XYK',
  'lbp': 'LBP',
  'dca': 'DCA',
  'otc': 'OTC',
  'bonds': 'Bonds',

  // Compound names
  'assetregistry': 'AssetRegistry',
  'emaoracle': 'EmaOracle',
  'circuitbreaker': 'CircuitBreaker',
  'omnipoolwarehouse': 'OmnipoolWarehouse',
  'omnipoolmining': 'OmnipoolLiquidityMining',
  'omnipooliquiditymining': 'OmnipoolLiquidityMining',
  'xykliquiditymining': 'XYKLiquidityMining',
  'parachainsystem': 'ParachainSystem',
  'parachaininfo': 'ParachainInfo',
  'collatorselection': 'CollatorSelection',
  'transactionpayment': 'TransactionPayment',
  'multipaymentsupport': 'MultiPaymentSupport',
  'relaychain': 'RelayChainInfo',
  'relaychaininfo': 'RelayChainInfo',

  // XCM pallets
  'xcmpqueue': 'XcmpQueue',
  'polkadotxcm': 'PolkadotXcm',
  'xcmprecompiles': 'XcmPrecompiles',
  'dmpqueue': 'DmpQueue',
  'xcmtransactor': 'XcmTransactor',
  'xcmratelimiter': 'XcmRateLimiter',

  // Frontier/EVM pallets
  'evm': 'EVM',
  'ethereum': 'Ethereum',
  'dynamicevmfee': 'DynamicEvmFee',
  'evmaccounts': 'EVMAccounts',

  // Other common pallets
  'claims': 'Claims',
  'currencies': 'Currencies',
  'authorship': 'Authorship',
  'session': 'Session',
  'aura': 'Aura',
  'grandpa': 'Grandpa',
  'offences': 'Offences',
  'historical': 'Historical',

  // Farming
  'farm': 'OmnipoolLiquidityMining',
  'farms': 'OmnipoolLiquidityMining',
  'liquiditymining': 'OmnipoolLiquidityMining',

  // Dispatcher
  'dispatcher': 'Dispatcher',
};

/**
 * Normalize a pallet name to its canonical PascalCase form.
 *
 * Rules:
 * 1. Check known mappings first (handles special cases like XYK, EVM, DCA)
 * 2. If not found, convert to PascalCase (e.g., "assetRegistry" -> "AssetRegistry")
 * 3. Preserve already-correct PascalCase names
 *
 * @param name - The pallet name (may be lowercase, camelCase, or PascalCase)
 * @returns The canonical PascalCase pallet name
 */
export function normalizePalletName(name: string): string {
  // Check known mappings first (case-insensitive)
  const lowerName = name.toLowerCase();
  if (PALLET_NAME_MAP[lowerName]) {
    return PALLET_NAME_MAP[lowerName];
  }

  // If already PascalCase and starts with uppercase, return as-is
  if (name[0] === name[0].toUpperCase() && name.length > 1) {
    return name;
  }

  // Convert to PascalCase: capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Get the URL path for a pallet documentation page.
 *
 * @param palletName - The pallet name (any case)
 * @returns The URL path like "/reference/pallets/Router"
 */
export function getPalletDocPath(palletName: string): string {
  return `/reference/pallets/${normalizePalletName(palletName)}`;
}
