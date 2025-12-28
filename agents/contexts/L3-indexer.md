# L3: Indexer Context

> **Auto-generated** - Do not edit manually.
> Extracted: 2025-12-27T19:24:57.493Z
> Commit: `ae6ed3c` (develop)

## Summary

| Metric | Count |
|--------|-------|
| Entities | 123 |
| Handlers | 49 |
| Runtime Events Indexed | 116 |
| Events with Handlers | 44 |

## Endpoints

- **Production:** https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphiql
- **Testnet:** https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphiql

## Runtime Events Indexed

These are the Substrate runtime events that this indexer listens to and processes.

### AssetRegistry (3)

| Event | Handlers | Entities |
|-------|----------|----------|
| [LocationSet](/reference/indexer/Asset) | `assetLocationSet` | [Asset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/asset.model.ts) |
| [Registered](/reference/indexer/Asset) | `assetRegistered` | [Asset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/asset.model.ts) |
| [Updated](/reference/indexer/Asset) | `assetUpdated` | [Asset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/asset.model.ts) |

### Balances (21)

| Event | Handlers | Entities |
|-------|----------|----------|
| BalanceSet | - | - |
| Burned | - | - |
| Deposit | - | - |
| DustLost | - | - |
| Endowed | - | - |
| Frozen | - | - |
| Issued | - | - |
| Locked | - | - |
| Minted | - | - |
| Rescinded | - | - |
| ReserveRepatriated | - | - |
| Reserved | - | - |
| Slashed | - | - |
| Suspended | - | - |
| Thawed | - | - |
| TotalIssuanceForced | - | - |
| Transfer | `handleBalancesTransfer` | - |
| Unlocked | - | - |
| Unreserved | - | - |
| Upgraded | - | - |
| Withdraw | - | - |

### Broadcast (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| Swapped | `handleBroadcastSwappedEvent` | - |

### Currencies (4)

| Event | Handlers | Entities |
|-------|----------|----------|
| BalanceUpdated | - | - |
| Deposited | - | - |
| Transferred | `handleCurrenciesTransfer` | - |
| Withdrawn | - | - |

### Dca (8)

| Event | Handlers | Entities |
|-------|----------|----------|
| [Completed](/reference/indexer/DcaSchedule) | `handleDcaScheduleCompleted` | [DcaSchedule](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaSchedule.model.ts), [DcaScheduleStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleStatus.model.ts), [DcaScheduleOrderRouteHop](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleOrderRouteHop.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |
| [ExecutionPlanned](/reference/indexer/DcaScheduleExecution) | `handleDcaScheduleExecutionPlanned` | [DcaScheduleExecution](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecution.model.ts), [DcaScheduleExecutionStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecutionStatus.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |
| ExecutionStarted | - | - |
| RandomnessGenerationFailed | - | - |
| [Scheduled](/reference/indexer/DcaSchedule) | `handleDcaScheduleCreated` | [DcaSchedule](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaSchedule.model.ts), [DcaScheduleStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleStatus.model.ts), [DcaScheduleOrderRouteHop](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleOrderRouteHop.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |
| [Terminated](/reference/indexer/DcaSchedule) | `handleDcaScheduleTerminated` | [DcaSchedule](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaSchedule.model.ts), [DcaScheduleStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleStatus.model.ts), [DcaScheduleOrderRouteHop](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleOrderRouteHop.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |
| [TradeExecuted](/reference/indexer/DcaScheduleExecution) | `handleDcaTradeExecuted` | [DcaScheduleExecution](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecution.model.ts), [DcaScheduleExecutionStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecutionStatus.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |
| [TradeFailed](/reference/indexer/DcaScheduleExecution) | `handleDcaTradeFailed` | [DcaScheduleExecution](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecution.model.ts), [DcaScheduleExecutionStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dcaScheduleExecutionStatus.model.ts), [DispatchError](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/dispatchError.model.ts) |

### Duster (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| Dusted | - | - |

### Evm (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| [Log](/reference/indexer/Account) | `getOrCreateAccount` | [Account](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/account.model.ts) |

### EvmAccounts (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| Bound | `handleEvmAccountsBoundEvent` | - |

### Lbp (4)

| Event | Handlers | Entities |
|-------|----------|----------|
| BuyExecuted | `lpbSellExecuted` | - |
| [PoolCreated](/reference/indexer/Lbppool) | `lpbpoolCreated` | [Lbppool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/lbppool.model.ts) |
| [PoolUpdated](/reference/indexer/Lbppool) | `lpbpoolUpdated` | [Lbppool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/lbppool.model.ts) |
| SellExecuted | `lpbSellExecuted` | - |

### Omnipool (9)

| Event | Handlers | Entities |
|-------|----------|----------|
| [BuyExecuted](/reference/indexer/OmnipoolAsset) | `omnipoolBuySellExecuted` | [OmnipoolAsset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolAsset.model.ts) |
| LiquidityAdded | - | - |
| LiquidityRemoved | - | - |
| PositionCreated | `handleOmnipoolLiquidityPositionCreated` | - |
| PositionDestroyed | `handleOmnipoolLiquidityPositionDestroyed` | - |
| PositionUpdated | `handleOmnipoolLiquidityPositionUpdated` | - |
| [SellExecuted](/reference/indexer/OmnipoolAsset) | `omnipoolBuySellExecuted` | [OmnipoolAsset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolAsset.model.ts) |
| TokenAdded | `omnipoolTokenAdded` | - |
| TokenRemoved | `omnipoolTokenRemoved` | - |

### OmnipoolLiquidityMining (13)

| Event | Handlers | Entities |
|-------|----------|----------|
| [DepositDestroyed](/reference/indexer/OmnipoolYieldFarmDeposit) | `handleOmnipoolLMDepositDestroyed` | [OmnipoolYieldFarmDeposit](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolYieldFarmDeposit.model.ts), [YieldFarmDepositStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/yieldFarmDepositStatus.model.ts) |
| GlobalFarmCreated | - | - |
| GlobalFarmTerminated | - | - |
| GlobalFarmUpdated | - | - |
| RewardClaimed | - | - |
| [SharesDeposited](/reference/indexer/OmnipoolYieldFarmDeposit) | `handleOmnipoolLMSharesDeposited` | [OmnipoolYieldFarmDeposit](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolYieldFarmDeposit.model.ts), [YieldFarmDepositStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/yieldFarmDepositStatus.model.ts) |
| SharesRedeposited | - | - |
| SharesWithdrawn | - | - |
| YieldFarmCreated | - | - |
| YieldFarmResumed | - | - |
| YieldFarmStopped | - | - |
| YieldFarmTerminated | - | - |
| YieldFarmUpdated | - | - |

### OmnipoolWarehouseLm (3)

| Event | Handlers | Entities |
|-------|----------|----------|
| AllRewardsDistributed | - | - |
| GlobalFarmAccRpzUpdated | - | - |
| YieldFarmAccRpvsUpdated | - | - |

### Otc (4)

| Event | Handlers | Entities |
|-------|----------|----------|
| [Cancelled](/reference/indexer/OtcOrder) | `handleOtcOrderCancelled` | [OtcOrder](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrder.model.ts), [OtcOrderEvent](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrderEvent.model.ts) |
| [Filled](/reference/indexer/OtcOrder) | `handleOtcOrderFilled` | [OtcOrder](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrder.model.ts), [OtcOrderEvent](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrderEvent.model.ts) |
| [PartiallyFilled](/reference/indexer/OtcOrder) | `handleOtcOrderPartiallyFilled` | [OtcOrder](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrder.model.ts), [OtcOrderEvent](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrderEvent.model.ts) |
| [Placed](/reference/indexer/OtcOrder) | `handleOtcOrderPlaced` | [OtcOrder](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrder.model.ts), [OtcOrderEvent](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/otcOrderEvent.model.ts) |

### RelayChainInfo (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| CurrentBlockNumbers | - | - |

### Stableswap (5)

| Event | Handlers | Entities |
|-------|----------|----------|
| BuyExecuted | `stablepoolBuySellExecuted` | - |
| LiquidityAdded | `stablepoolBuySellExecuted` | - |
| LiquidityRemoved | `stablepoolBuySellExecuted` | - |
| PoolCreated | `stableswapCreated` | - |
| SellExecuted | `stablepoolBuySellExecuted` | - |

### Tokens (17)

| Event | Handlers | Entities |
|-------|----------|----------|
| BalanceSet | - | - |
| Deposited | - | - |
| DustLost | - | - |
| Endowed | - | - |
| Issued | - | - |
| LockRemoved | - | - |
| LockSet | - | - |
| Locked | - | - |
| Rescinded | - | - |
| ReserveRepatriated | - | - |
| Reserved | - | - |
| Slashed | - | - |
| TotalIssuanceSet | - | - |
| Transfer | `handleTokensTransfer` | - |
| Unlocked | - | - |
| Unreserved | - | - |
| Withdrawn | - | - |

### Uniques (1)

| Event | Handlers | Entities |
|-------|----------|----------|
| Transferred | `handleUniquesItemTransferred` | - |

### Xyk (6)

| Event | Handlers | Entities |
|-------|----------|----------|
| [BuyExecuted](/reference/indexer/OmnipoolAsset) | `xykSellExecuted` | [OmnipoolAsset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolAsset.model.ts), [Xykpool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykpool.model.ts) |
| LiquidityAdded | - | - |
| LiquidityRemoved | - | - |
| [PoolCreated](/reference/indexer/Xykpool) | `xykPoolCreated` | [Xykpool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykpool.model.ts) |
| [PoolDestroyed](/reference/indexer/Xykpool) | `xykPoolDestroyed` | [Xykpool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykpool.model.ts) |
| [SellExecuted](/reference/indexer/OmnipoolAsset) | `xykSellExecuted` | [OmnipoolAsset](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/omnipoolAsset.model.ts), [Xykpool](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykpool.model.ts) |

### XykLiquidityMining (13)

| Event | Handlers | Entities |
|-------|----------|----------|
| [DepositDestroyed](/reference/indexer/XykYieldFarmDeposit) | `handleXylpoolLMDepositDestroyed` | [XykYieldFarmDeposit](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykYieldFarmDeposit.model.ts), [YieldFarmDepositStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/yieldFarmDepositStatus.model.ts) |
| GlobalFarmCreated | - | - |
| GlobalFarmTerminated | - | - |
| GlobalFarmUpdated | - | - |
| RewardClaimed | - | - |
| [SharesDeposited](/reference/indexer/XykYieldFarmDeposit) | `handleXylpoolLMSharesDeposited` | [XykYieldFarmDeposit](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/xykYieldFarmDeposit.model.ts), [YieldFarmDepositStatus](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/yieldFarmDepositStatus.model.ts) |
| SharesRedeposited | - | - |
| SharesWithdrawn | - | - |
| YieldFarmCreated | - | - |
| YieldFarmResumed | - | - |
| YieldFarmStopped | - | - |
| YieldFarmTerminated | - | - |
| YieldFarmUpdated | - | - |


## Entities by Domain

### Other (25)

- **ProcessorStatus** (10 fields)
- **PreprocessedDataBucket** (5 fields)
- **Block** (9 fields)
- **Extrinsic** (7 fields)
- **Call** (16 fields)
- **Event** (12 fields)
- **ChainActivityTrace** (18 fields)
- **ChainActivityTraceRelation** (6 fields)
- **Transfer** (12 fields)
- **Hsmpool** (5 fields)
- **HsmCollateral** (5 fields)
- **AaveFacilitator** (3 fields)
- **DispatchError** (3 fields)
- **Aavepool** (6 fields)
- **MmSupply** (11 fields)
- **MmWithdraw** (10 fields)
- **MmBorrow** (12 fields)
- **MmUserEModeSet** (7 fields)
- **MmRepay** (10 fields)
- **MmLiquidationCall** (12 fields)
- **MmReserveUsedAsCollateralEnabledEvent** (7 fields)
- **MmReserveUsedAsCollateralDisabledEvent** (7 fields)
- **MoneyMarketEvent** (20 fields)
- **MoneyMarketReserve** (12 fields)
- **NftCollection** (13 fields)

### Assets (19)

- **Asset** (20 fields)
- **AssetMultiLocationsInterior** (15 fields)
- **AssetMultiLocation** (3 fields)
- **AssetVolumeHistoricalData** (13 fields)
- **AssetSwapFeeHistoricalData** (7 fields)
- **AssetSpotPriceHistoricalData** (14 fields)
- **AssetDynamicFee** (3 fields)
- **AssetHistoricalData** (14 fields)
- **AssetsPairVolumeHistoricalData** (10 fields)
- **AssetAssetsPairVolume** (4 fields)
- **AccountAssetBalanceHistoricalData** (10 fields)
- **AccountAssetBalanceLatest** (10 fields)
- **AccountAssetSwapFeeHistoricalData** (9 fields)
- **SwapAssetBalance** (5 fields)
- **RoutedTradeAssetBalance** (5 fields)
- **HsmpoolAssetHistoricalData** (22 fields)
- **BatchHsmpoolAssetHistVolsList** (4 fields)
- **DynamicFeesAssetFeeParameters** (4 fields)
- **NftAsset** (5 fields)

### Accounts (5)

- **AccountTotalBalanceHistoricalData** (9 fields)
- **AccountMmPositionHistoricalData** (13 fields)
- **Account** (34 fields)
- **AccountSwapFeeHistoricalData** (7 fields)
- **AccountChainActivityTrace** (3 fields)

### Trading (3)

- **SwapFee** (6 fields)
- **Swap** (23 fields)
- **RoutedTrade** (18 fields)

### Pools (53)

- **Lbppool** (25 fields)
- **LbppoolCreatedData** (5 fields)
- **LbppoolDestroyedData** (3 fields)
- **LbppoolLifeState** (2 fields)
- **LbppoolPriceHistoricalData** (9 fields)
- **LbppoolVolumeHistoricalData** (32 fields)
- **BatchLbppoolHistVolsList** (4 fields)
- **LbppoolHistoricalData** (19 fields)
- **Xykpool** (19 fields)
- **XykpoolCreatedData** (4 fields)
- **XykpoolDestroyedData** (3 fields)
- **XykpoolLifeState** (2 fields)
- **XykpoolPriceHistoricalData** (9 fields)
- **XykpoolVolumeHistoricalData** (32 fields)
- **BatchXykpoolHistVolsList** (4 fields)
- **XykpoolHistoricalData** (10 fields)
- **Omnipool** (7 fields)
- **OmnipoolAsset** (12 fields)
- **OmnipoolAssetAddedData** (5 fields)
- **OmnipoolAssetRemovedData** (5 fields)
- **OmnipoolAssetLifeState** (2 fields)
- **OmnipoolAssetVolumeHistoricalData** (17 fields)
- **BatchOmnipoolAssetHistVolsList** (5 fields)
- **OmnipoolHistoricalData** (8 fields)
- **OmnipoolAssetHistoricalData** (14 fields)
- **OmnipoolAssetHistoricalDataLatest** (13 fields)
- **Stableswap** (10 fields)
- **StableswapCreatedData** (3 fields)
- **StableswapDestroyedData** (3 fields)
- **StableswapLifeState** (2 fields)
- **StableswapAsset** (4 fields)
- **StableswapVolumeHistoricalData** (13 fields)
- **StableswapAssetVolumeHistoricalData** (18 fields)
- **BatchStableswapHistVolsList** (4 fields)
- **StableswapLiquidityEvent** (12 fields)
- **StableswapAssetLiquidityAmount** (4 fields)
- **StableswapPegsSource** (5 fields)
- **StableswapHistoricalData** (16 fields)
- **StableswapAssetHistoricalData** (10 fields)
- **StableswapAssetHistoricalDataLatest** (10 fields)
- **OmnipoolLiquidityPosition** (15 fields)
- **OmnipoolLiquidityPositionEvent** (11 fields)
- **OmnipoolAssetLiquidityEvent** (11 fields)
- **OmnipoolGlobalFarm** (23 fields)
- **OmnipoolYieldFarm** (17 fields)
- **OmnipoolYieldFarmDeposit** (11 fields)
- **OmnipoolYieldFarmDepositEvent** (12 fields)
- **OmnipoolYieldFarmEntry** (9 fields)
- **XykGlobalFarm** (23 fields)
- **XykYieldFarm** (19 fields)
- **XykYieldFarmDeposit** (11 fields)
- **XykYieldFarmEntry** (10 fields)
- **XykYieldFarmDepositEvent** (12 fields)

### Historical Data (9)

- **HsmpoolHistoricalData** (8 fields)
- **HsmCollateralConfigHistoricalData** (11 fields)
- **AaveFacilitatorHistoricalData** (8 fields)
- **ConstantsHistoricalData** (29 fields)
- **EmaOracleEntryHistoricalData** (19 fields)
- **AavepoolHistoricalData** (14 fields)
- **MmReserveConfigHistoricalData** (31 fields)
- **MmReserveIndexesHistoricalData** (9 fields)
- **TransactionPaymentHistoricalData** (4 fields)

### DCA/Orders (7)

- **DcaSchedule** (27 fields)
- **DcaScheduleOrderRouteHop** (5 fields)
- **DcaScheduleEvent** (8 fields)
- **DcaScheduleExecution** (6 fields)
- **DcaScheduleExecutionEvent** (10 fields)
- **OtcOrder** (14 fields)
- **OtcOrderEvent** (13 fields)

### Liquidity Mining (2)

- **FarmLifeState** (4 fields)
- **YieldFarmLoyaltyCurve** (2 fields)


## Event Handlers by Pallet

### EVM (1)

- `EVM.Log` → getOrCreateAccount

### AssetRegistry (3)

- `AssetRegistry.Registered` → assetRegistered
- `AssetRegistry.Updated` → assetUpdated
- `AssetRegistry.LocationSet` → assetLocationSet

### DCA (6)

- `DCA.Scheduled` → handleDcaScheduleCreated
- `DCA.Completed` → handleDcaScheduleCompleted
- `DCA.Terminated` → handleDcaScheduleTerminated
- `DCA.ExecutionPlanned` → handleDcaScheduleExecutionPlanned
- `DCA.TradeExecuted` → handleDcaTradeExecuted
- `DCA.TradeFailed` → handleDcaTradeFailed

### EVMAccounts (1)

- `EVMAccounts.Bound` → handleEvmAccountsBoundEvent

### OTC (4)

- `OTC.Placed` → handleOtcOrderPlaced
- `OTC.Cancelled` → handleOtcOrderCancelled
- `OTC.Filled` → handleOtcOrderFilled
- `OTC.PartiallyFilled` → handleOtcOrderPartiallyFilled

### Broadcast (3)

- `Broadcast.Swapped` → handleBroadcastSwappedEvent
- `Broadcast.Swapped2` → handleBroadcastSwappedEvent
- `Broadcast.Swapped3` → handleBroadcastSwappedEvent

### Balances (1)

- `Balances.Transfer` → handleBalancesTransfer

### Tokens (1)

- `Tokens.Transfer` → handleTokensTransfer

### Currencies (1)

- `Currencies.Transferred` → handleCurrenciesTransfer

### Uniques (1)

- `Uniques.Transferred` → handleUniquesItemTransferred

### LBP (4)

- `LBP.BuyExecuted` → lpbSellExecuted
- `LBP.SellExecuted` → lpbSellExecuted
- `LBP.PoolCreated` → lpbpoolCreated
- `LBP.PoolUpdated` → lpbpoolUpdated

### Omnipool (7)

- `Omnipool.BuyExecuted` → omnipoolBuySellExecuted
- `Omnipool.SellExecuted` → omnipoolBuySellExecuted
- `Omnipool.PositionCreated` → handleOmnipoolLiquidityPositionCreated
- `Omnipool.PositionUpdated` → handleOmnipoolLiquidityPositionUpdated
- `Omnipool.PositionDestroyed` → handleOmnipoolLiquidityPositionDestroyed
- `Omnipool.TokenAdded` → omnipoolTokenAdded
- `Omnipool.TokenRemoved` → omnipoolTokenRemoved

### Stableswap (5)

- `Stableswap.BuyExecuted` → stablepoolBuySellExecuted
- `Stableswap.SellExecuted` → stablepoolBuySellExecuted
- `Stableswap.LiquidityAdded` → stablepoolBuySellExecuted
- `Stableswap.LiquidityRemoved` → stablepoolBuySellExecuted
- `Stableswap.PoolCreated` → stableswapCreated

### XYK (4)

- `XYK.BuyExecuted` → xykSellExecuted
- `XYK.SellExecuted` → xykSellExecuted
- `XYK.PoolCreated` → xykPoolCreated
- `XYK.PoolDestroyed` → xykPoolDestroyed

### OmnipoolLiquidityMining (2)

- `OmnipoolLiquidityMining.SharesDeposited` → handleOmnipoolLMSharesDeposited
- `OmnipoolLiquidityMining.DepositDestroyed` → handleOmnipoolLMDepositDestroyed

### XYKLiquidityMining (2)

- `XYKLiquidityMining.SharesDeposited` → handleXylpoolLMSharesDeposited
- `XYKLiquidityMining.DepositDestroyed` → handleXylpoolLMDepositDestroyed

### HSM (3)

- `HSM.CollateralAdded` → handleCollateralAddedEvent
- `HSM.CollateralUpdated` → handleCollateralUpdatedEvent
- `HSM.CollateralRemoved` → handleCollateralRemovedEvent


## Entity Details

<details>
<summary>Full entity field listings (click to expand)</summary>

### ProcessorStatus

| Field | Type |
|-------|------|
| id | ID |
| assetsLastUpdatedAtBlock | Int |
| poolsDestroyedUpdatedAtBlock | Int? |
| initialIndexingStartedAt | DateTime |
| initialIndexingFinishedAt | DateTime? |
| latestProcessedBlock | Int |
| stableswapHistDataLatestBlock | Int? |
| omnipoolHistDataLatestBlock | Int? |
| xykpoolHistDataLatestBlock | Int? |
| aavepoolHistDataLatestBlock | Int? |

### PreprocessedDataBucket

| Field | Type |
|-------|------|
| id | ID |
| processorId | String |
| paraBlockHeight | Int |
| entityName | String |
| data | JSON |

### Asset

| Field | Type |
|-------|------|
| id | ID |
| assetRegistryId | String @index? |
| evmAddress | String? |
| multiLocationIds | [String]? |
| multiLocationsMetadata | [AssetMultiLocation]? |
| multiLocations | [AssetMultiLocation]? |
| underlyingAsset | Asset? |
| aToken | Asset? |
| variableDebtToken | Asset? |
| bondUnderlyingAsset | Asset? |
| assetType | AssetType |
| resourceType | ResourceType |
| name | String? |
| symbol | String? |
| decimals | Int? |
| xcmRateLimit | BigInt? |
| isSufficient | Boolean |
| existentialDeposit | BigInt |
| bondMaturity | BigInt? |
| note | existentialDeposit is probably taken 1:1 from the runtime? |

### AssetMultiLocationsInterior

| Field | Type |
|-------|------|
| kind | AssetMultiLocationsInteriorKind |
| network | String? |
| id | String? |
| index | String? |
| key | String? |
| value | String? |
| valueJson | JSON? |
| data | String? |
| part | String? |
| nom | String? |
| denom | String? |
| count | String? |
| blockNumber | String? |
| blockHash | String? |
| chainId | String? |

### AssetMultiLocation

| Field | Type |
|-------|------|
| parents | Int |
| hierarchyLevel | String |
| interior | [AssetMultiLocationsInterior |

### AssetVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| asset | Asset |
| volumeIn | BigInt |
| volumeOut | BigInt |
| totalVolumeIn | BigInt |
| totalVolumeOut | BigInt |
| volumeInNorm | String? |
| volumeOutNorm | String? |
| totalVolumeInNorm | String? |
| totalVolumeOutNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AssetSwapFeeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| asset | Asset |
| amount | BigInt |
| totalAmount | BigInt |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AssetSpotPriceHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| assetInHistData | AssetHistoricalData |
| assetIn | Asset |
| assetOut | Asset |
| assetInAssetRegistryId | String? |
| assetOutAssetRegistryId | String? |
| assetOutDecimals | Int |
| price | BigInt |
| priceNormalised | String |
| values | pool address? |
| priceRoute | [[String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AssetDynamicFee

| Field | Type |
|-------|------|
| assetFee | Int |
| protocolFee | Int |
| timestamp | Int |

### AssetHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| asset | Asset |
| assetRegistryId | String? |
| totalIssuance | BigInt |
| existentialDeposit | BigInt |
| dynamicFee | AssetDynamicFee? |
| usdPriceNormalised | String |
| spotPrices | [AssetSpotPriceHistoricalData] |
| field | "assetInHistData")? |
| assetPairVolumes | [AssetAssetsPairVolume] |
| field | "assetHistoricalData")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AssetsPairVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| assetA | Asset |
| assetB | Asset |
| assetAVolume | BigInt |
| assetBVolume | BigInt |
| 10 | USDT) and normalised to decimal format"? |
| totalVolumeNormalised | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AssetAssetsPairVolume

| Field | Type |
|-------|------|
| id | ID |
| assetHistoricalData | AssetHistoricalData |
| assetsPairVolumeHistoricalData | AssetsPairVolumeHistoricalData |
| paraBlockHeight | Int |

### AccountAssetBalanceHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| asset | Asset |
| transferable | BigInt |
| totalLocked | BigInt |
| transferableInRefAssetNorm | String? |
| totalLockedInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AccountAssetBalanceLatest

| Field | Type |
|-------|------|
| id | ID |
| accountId | String |
| assetId | String |
| transferable | BigInt |
| totalLocked | BigInt |
| transferableInRefAssetNorm | String? |
| totalLockedInRefAssetNorm | String? |
| total | BigInt |
| paraBlockHeight | Int |
| blockId | String |

### AccountTotalBalanceHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| refAsset | Asset |
| totalTransferableNorm | String |
| totalLockedNorm | String |
| totalDebtNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AccountMmPositionHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| accountBoundEvmAddress | String? |
| totalCollateralBase | String |
| totalDebtBase | String |
| availableBorrowsBase | String |
| currentLiquidationThreshold | String |
| ltv | String |
| healthFactor | String? |
| poolAddress | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Account

| Field | Type |
|-------|------|
| id | ID |
| accountType | AccountType |
| boundEvmAddress | String? |
| evmAddressBoundEvent | Event? |
| assetBalanceHistoricalData | [AccountAssetBalanceHistoricalData]? |
| field | "account")? |
| balanceHistoricalData | [AccountAssetBalanceHistoricalData]? |
| field | "account")? |
| historicalAccountSwapFees | [AccountSwapFeeHistoricalData]? |
| field | "account")? |
| mmPositionHistoricalData | [AccountMmPositionHistoricalData]? |
| field | "account")? |
| lbppool | Lbppool? |
| xykpool | Xykpool? |
| omnipool | Omnipool? |
| stableswap | Stableswap? |
| hsmpool | Hsmpool? |
| initiatedActions | [ChainActivityTrace |
| field | "originator")? |
| participatedActions | [AccountChainActivityTrace |
| field | "account")? |
| initiatedSwaps | [Swap |
| field | "swapper")? |
| filledSwaps | [Swap |
| field | "filler")? |
| transfersTo | [Transfer |
| field | "to")? |
| transfersFrom | [Transfer |
| field | "from")? |
| dcaSchedules | [DcaSchedule |
| field | "owner")? |
| otcOrders | [OtcOrder |
| field | "owner")? |
| TODO | add proxy and multisig tracking? |

### AccountAssetSwapFeeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| collection | AccountSwapFeeHistoricalData |
| account | Account |
| asset | Asset |
| amount | BigInt |
| totalAmount | BigInt |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AccountSwapFeeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| fees | [AccountAssetSwapFeeHistoricalData |
| field | "collection")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Block

| Field | Type |
|-------|------|
| id | ID |
| extrinsics | [Extrinsic] @derivedFrom(field: "block")? |
| calls | [Call] @derivedFrom(field: "block")? |
| events | [Event] @derivedFrom(field: "block")? |
| chainActivityTraces | [ChainActivityTrace] @derivedFrom(field: "block")? |
| height | Int |
| hash | String |
| timestamp | DateTime |
| relayBlockHeight | Int |

### Extrinsic

| Field | Type |
|-------|------|
| id | ID |
| hash | String |
| indexInBlock | Int |
| calls | [Call] @derivedFrom(field: "extrinsic")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Call

| Field | Type |
|-------|------|
| id | ID |
| traceId | String |
| args | String? |
| success | Boolean? |
| name | String |
| originKind | String |
| originValueKind | String? |
| originValue | String? |
| entityTypes | [TraceEntityType]? |
| subcalls | [Call] @derivedFrom(field: "parent")? |
| events | [Event] @derivedFrom(field: "call")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |
| extrinsic | Extrinsic |
| parent | Call? |

### Event

| Field | Type |
|-------|------|
| id | ID |
| traceId | String |
| args | String? |
| indexInBlock | Int |
| name | String |
| group | EventGroup? |
| phase | String |
| entityTypes | [TraceEntityType]? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |
| call | Call? |

### ChainActivityTrace

| Field | Type |
|-------|------|
| id | ID |
| Batch | 1419/Router:1420/Omnipool:1421? |
| Omnipool | 20554? |
| operationIds | [String |
| id | //context:<call>/<extrinsic_id>/<call_id>/<call_id>/<call_id>? |
| id | //context:<event>/<block_id>:<group_name>/<event_index>? |
| id | //context:call/0003396328-000002-70ca4/0003396328-000002-70ca4-000002/0003396328-000002-70ca4-000003/0003681428-fa806-000020? |
| id | //context:event/0003396328-70ca4:buyback/2? |
| traceIds | [String |
| originator | Account? |
| participants | [AccountChainActivityTrace |
| field | "chainActivityTrace")? |
| participantAccounts | [String |
| childTraces | [ChainActivityTraceRelation] @derivedFrom(field: "parentTrace")? |
| parentTraces | [ChainActivityTraceRelation] @derivedFrom(field: "childTrace")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AccountChainActivityTrace

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| chainActivityTrace | ChainActivityTrace |

### ChainActivityTraceRelation

| Field | Type |
|-------|------|
| id | ID |
| parentTrace | ChainActivityTrace |
| childTrace | ChainActivityTrace |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Transfer

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| asset | Asset |
| assetType | AssetType |
| from | Account |
| to | Account |
| amount | BigInt |
| txFee | BigInt |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### SwapFee

| Field | Type |
|-------|------|
| id | ID |
| swap | Swap |
| asset | Asset |
| amount | BigInt |
| destinationType | SwapFeeDestinationType |
| recipient | Account? |

### SwapAssetBalance

| Field | Type |
|-------|------|
| id | ID |
| swap | Swap |
| assetBalanceType | SwapAssetBalanceType |
| asset | Asset |
| amount | BigInt |

### Swap

| Field | Type |
|-------|------|
| id | ID |
| operationId | String? |
| traceIds | [String |
| swapIndex | Int? |
| swapper | Account |
| filler | Account |
| fillerType | SwapFillerType |
| operationType | TradeOperationType |
| inputs | [SwapAssetBalance |
| field | "swap")? |
| outputs | [SwapAssetBalance |
| field | "swap")? |
| fees | [SwapFee |
| field | "swap")? |
| allInvolvedAssetIds | [String |
| allInvolvedAssetRegistryIds | [String |
| dcaScheduleExecutionEvent | DcaScheduleExecutionEvent? |
| otcOrderFulfillment | OtcOrderEvent? |
| routedTrade | RoutedTrade? |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### RoutedTradeAssetBalance

| Field | Type |
|-------|------|
| id | ID |
| routedTrade | RoutedTrade |
| assetBalanceType | SwapAssetBalanceType |
| asset | Asset |
| amount | BigInt |

### RoutedTrade

| Field | Type |
|-------|------|
| id | ID |
| routeId | String? |
| inputs | [RoutedTradeAssetBalance] @derivedFrom(field: "routedTrade")? |
| outputs | [RoutedTradeAssetBalance] @derivedFrom(field: "routedTrade")? |
| inputAssetIds | [String |
| inputAssetRegistryIds | [String |
| outputAssetIds | [String |
| outputAssetRegistryIds | [String |
| allInvolvedAssetIds | [String |
| allInvolvedAssetRegistryIds | [String |
| participantSwappers | [String |
| participantFillers | [String |
| feeRecipients | [String |
| swaps | [Swap |
| field | "routedTrade")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Lbppool

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| owner | Account? |
| feeCollector | Account? |
| startBlockNumber | Int? |
| endBlockNumber | Int? |
| initialWeight | Int? |
| finalWeight | Int? |
| fee | [Int]? |
| repayTarget | BigInt? |
| createdAtParaBlockHeight | Int |
| createdAtRelayBlockHeight | Int |
| createdAtBlock | Block |
| isDestroyed | Boolean? |
| lifeStates | [LbppoolLifeState |
| historicalBlockPrices | [LbppoolPriceHistoricalData |
| field | "pool")? |
| historicalVolume | [LbppoolVolumeHistoricalData |
| field | "pool")? |
| historicalData | [LbppoolHistoricalData |
| field | "pool")? |

### LbppoolCreatedData

| Field | Type |
|-------|------|
| assetABalance | String |
| assetBBalance | String |
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### LbppoolDestroyedData

| Field | Type |
|-------|------|
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### LbppoolLifeState

| Field | Type |
|-------|------|
| created | LbppoolCreatedData |
| destroyed | LbppoolDestroyedData? |

### LbppoolPriceHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Lbppool |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### LbppoolVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Lbppool |
| assetA | Asset |
| assetB | Asset |
| averagePrice | Float |
| assetAVolIn | BigInt |
| assetAVolOut | BigInt |
| assetATotalVolIn | BigInt |
| assetATotalVolOut | BigInt |
| assetAFeeVol | BigInt |
| assetBFeeVol | BigInt |
| assetAFeesTotalVol | BigInt |
| assetBFeesTotalVol | BigInt |
| assetBVolIn | BigInt |
| assetBVolOut | BigInt |
| assetBTotalVolIn | BigInt |
| assetBTotalVolOut | BigInt |
| assetAVolInNorm | String |
| assetAVolOutNorm | String |
| assetBVolInNorm | String |
| assetBVolOutNorm | String |
| assetAFeeVolNorm | String |
| assetBFeeVolNorm | String |
| assetATotalVolInNorm | String |
| assetATotalVolOutNorm | String |
| assetBTotalVolInNorm | String |
| assetBTotalVolOutNorm | String |
| assetAFeesTotalVolNorm | String |
| assetBFeesTotalVolNorm | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### BatchLbppoolHistVolsList

| Field | Type |
|-------|------|
| id | ID |
| poolIds | [String |
| batchStartParaBlockHeight | Int |
| batchEndParaBlockHeight | Int |

### LbppoolHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Lbppool |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| owner | Account |
| feeCollector | Account? |
| startBlockNumber | Int? |
| endBlockNumber | Int? |
| initialWeight | Int |
| finalWeight | Int |
| repayTarget | BigInt |
| weightCurve | String |
| fee | [Int |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Xykpool

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| shareToken | Asset |
| tvlInRefAssetNorm | String? |
| createdAtParaBlockHeight | Int |
| createdAtRelayBlockHeight | Int |
| createdAtBlock | Block |
| isDestroyed | Boolean? |
| lifeStates | [XykpoolLifeState |
| historicalBlockPrices | [XykpoolPriceHistoricalData |
| field | "pool")? |
| historicalVolume | [XykpoolVolumeHistoricalData |
| field | "pool")? |
| historicalData | [XykpoolHistoricalData |
| field | "pool")? |

### XykpoolCreatedData

| Field | Type |
|-------|------|
| initialSharesAmount | String |
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### XykpoolDestroyedData

| Field | Type |
|-------|------|
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### XykpoolLifeState

| Field | Type |
|-------|------|
| created | XykpoolCreatedData |
| destroyed | XykpoolDestroyedData? |

### XykpoolPriceHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Xykpool |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### XykpoolVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Xykpool |
| assetA | Asset |
| assetB | Asset |
| averagePrice | Float |
| assetAVolIn | BigInt |
| assetAVolOut | BigInt |
| assetATotalVolIn | BigInt |
| assetATotalVolOut | BigInt |
| assetAFeeVol | BigInt |
| assetBFeeVol | BigInt |
| assetAFeesTotalVol | BigInt |
| assetBFeesTotalVol | BigInt |
| assetBVolIn | BigInt |
| assetBVolOut | BigInt |
| assetBTotalVolIn | BigInt |
| assetBTotalVolOut | BigInt |
| assetAVolInNorm | String |
| assetAVolOutNorm | String |
| assetBVolInNorm | String |
| assetBVolOutNorm | String |
| assetAFeeVolNorm | String |
| assetBFeeVolNorm | String |
| assetATotalVolInNorm | String |
| assetATotalVolOutNorm | String |
| assetBTotalVolInNorm | String |
| assetBTotalVolOutNorm | String |
| assetAFeesTotalVolNorm | String |
| assetBFeesTotalVolNorm | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### BatchXykpoolHistVolsList

| Field | Type |
|-------|------|
| id | ID |
| poolIds | [String |
| batchStartParaBlockHeight | Int |
| batchEndParaBlockHeight | Int |

### XykpoolHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Xykpool |
| assetA | Asset |
| assetB | Asset |
| assetABalance | BigInt |
| assetBBalance | BigInt |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### Omnipool

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| isDestroyed | Boolean? |
| destroyedAtParaBlockHeight | Int? |
| destroyedAtBlock | Block? |
| assets | [OmnipoolAsset |
| field | "pool")? |

### OmnipoolAsset

| Field | Type |
|-------|------|
| id | ID |
| pool | Omnipool |
| asset | Asset |
| addedAtParaBlockHeight | Int |
| addedAtRelayBlockHeight | Int |
| addedAtBlock | Block |
| isRemoved | Boolean? |
| lifeStates | [OmnipoolAssetLifeState |
| historicalVolume | [OmnipoolAssetVolumeHistoricalData |
| field | "omnipoolAsset")? |
| historicalData | [OmnipoolAssetHistoricalData |
| field | "omnipoolAsset")? |

### OmnipoolAssetAddedData

| Field | Type |
|-------|------|
| initialAmount | String? |
| initialPrice | String? |
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### OmnipoolAssetRemovedData

| Field | Type |
|-------|------|
| removedAmount | String? |
| hubWithdrawn | String? |
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### OmnipoolAssetLifeState

| Field | Type |
|-------|------|
| added | OmnipoolAssetAddedData |
| removed | OmnipoolAssetRemovedData? |

### OmnipoolAssetVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| omnipoolAsset | OmnipoolAsset |
| assetVolIn | BigInt |
| assetVolOut | BigInt |
| assetTotalVolIn | BigInt |
| assetTotalVolOut | BigInt |
| assetFeeVol | BigInt |
| assetTotalFeesVol | BigInt |
| assetVolInNorm | String |
| assetVolOutNorm | String |
| assetFeeVolNorm | String |
| assetTotalVolInNorm | String |
| assetTotalVolOutNorm | String |
| assetTotalFeesVolNorm | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### BatchOmnipoolAssetHistVolsList

| Field | Type |
|-------|------|
| id | ID |
| omnipoolAssetIds | [String |
| assetIds | [String |
| batchStartParaBlockHeight | Int |
| batchEndParaBlockHeight | Int |

### OmnipoolHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Omnipool |
| assetsHistoricalData | [OmnipoolAssetHistoricalData |
| field | "poolHistoricalData")? |
| tvlTotalInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### OmnipoolAssetHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| poolHistoricalData | OmnipoolHistoricalData |
| omnipoolAsset | OmnipoolAsset |
| asset | Asset |
| assetCap | BigInt |
| assetShares | BigInt |
| assetHubReserve | BigInt |
| assetProtocolShares | BigInt |
| freeBalance | BigInt |
| tradable | Int |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### OmnipoolAssetHistoricalDataLatest

| Field | Type |
|-------|------|
| id | ID |
| poolHistoricalDataId | String |
| omnipoolAssetId | String |
| assetId | String |
| assetCap | BigInt |
| assetShares | BigInt |
| assetHubReserve | BigInt |
| assetProtocolShares | BigInt |
| freeBalance | BigInt |
| tradable | Int |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| blockId | String |

### Stableswap

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| shareToken | Asset |
| createdAtParaBlockHeight | Int |
| createdAtRelayBlockHeight | Int |
| createdAtBlock | Block |
| isDestroyed | Boolean? |
| lifeStates | [StableswapLifeState |
| assets | [StableswapAsset |
| field | "pool")? |

### StableswapCreatedData

| Field | Type |
|-------|------|
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### StableswapDestroyedData

| Field | Type |
|-------|------|
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### StableswapLifeState

| Field | Type |
|-------|------|
| created | StableswapCreatedData |
| destroyed | StableswapDestroyedData? |

### StableswapAsset

| Field | Type |
|-------|------|
| id | ID |
| pool | Stableswap |
| asset | Asset |
| amount | BigInt |

### StableswapVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Stableswap |
| assetVolumes | [StableswapAssetVolumeHistoricalData |
| field | "volumesCollection")? |
| poolVolInNorm | String |
| poolVolOutNorm | String |
| poolFeesVolNorm | String |
| poolTotalVolInNorm | String |
| poolTotalVolOutNorm | String |
| poolTotalFeesVolNorm | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### StableswapAssetVolumeHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| volumesCollection | StableswapVolumeHistoricalData |
| asset | Asset |
| assetFeeVol | BigInt |
| assetTotalFeesVol | BigInt |
| assetVolIn | BigInt |
| assetVolOut | BigInt |
| assetTotalVolIn | BigInt |
| assetTotalVolOut | BigInt |
| assetVolInNorm | String |
| assetVolOutNorm | String |
| assetFeeVolNorm | String |
| assetTotalVolInNorm | String |
| assetTotalVolOutNorm | String |
| assetTotalFeesVolNorm | String |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### BatchStableswapHistVolsList

| Field | Type |
|-------|------|
| id | ID |
| poolIds | [String |
| batchStartParaBlockHeight | Int |
| batchEndParaBlockHeight | Int |

### StableswapLiquidityEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| pool | Stableswap |
| sharesAmount | BigInt |
| feeAmount | BigInt |
| assetAmounts | [StableswapAssetLiquidityAmount |
| field | "liquidityAction")? |
| actionType | LiquidityActionEvent |
| indexInBlock | Int |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### StableswapAssetLiquidityAmount

| Field | Type |
|-------|------|
| id | ID |
| liquidityAction | StableswapLiquidityEvent |
| asset | Asset |
| amount | BigInt |

### StableswapPegsSource

| Field | Type |
|-------|------|
| sourceKind | String |
| oracleName | String? |
| oraclePeriod | EmaOraclePeriod? |
| oracleAsset | String? |
| valuePoints | [String |

### StableswapHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Stableswap |
| assetsHistoricalData | [StableswapAssetHistoricalData |
| field | "poolHistoricalData")? |
| initialAmplification | Int |
| finalAmplification | Int |
| initialAmplificationChangeAtBlockHeight | Int |
| finalAmplificationChangeAtBlockHeight | Int |
| fee | Int |
| pegs | [[BigInt |
| maxPegUpdate | Int? |
| pegSources | [StableswapPegsSource |
| tvlTotalInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### StableswapAssetHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| asset | Asset |
| stableswapAsset | StableswapAsset |
| poolHistoricalData | StableswapHistoricalData |
| freeBalance | BigInt |
| tradable | Int? |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### StableswapAssetHistoricalDataLatest

| Field | Type |
|-------|------|
| id | ID |
| assetId | String |
| poolId | String |
| stableswapAssetId | String |
| poolHistoricalDataId | String |
| freeBalance | BigInt |
| tradable | Int? |
| tvlInRefAssetNorm | String? |
| paraBlockHeight | Int |
| blockId | String |

### Hsmpool

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| facilitator | AaveFacilitator |
| collaterals | [HsmCollateral |
| field | "pool")? |

### HsmCollateral

| Field | Type |
|-------|------|
| id | ID |
| pool | Hsmpool |
| asset | Asset |
| stableswap | Stableswap |
| isRemoved | Boolean |

### HsmpoolHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Hsmpool |
| bucketCapacity | BigInt |
| bucketLevel | BigInt |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### HsmCollateralConfigHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| collateral | HsmCollateral |
| purchaseFee | BigInt |
| maxBuyPriceCoefficient | BigInt |
| buybackRate | BigInt |
| buyBackFee | BigInt |
| maxInHolding | BigInt |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### HsmpoolAssetHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| asset | Asset |
| collateral | HsmCollateral? |
| facilitatorHistData | AaveFacilitatorHistoricalData? |
| freeBalance | BigInt |
| tvlInRefAssetNorm | String? |
| assetVolIn | BigInt |
| assetVolOut | BigInt |
| assetFeeVol | BigInt |
| assetTotalVolIn | BigInt |
| assetTotalVolOut | BigInt |
| assetTotalFeesVol | BigInt |
| assetVolInNorm | String |
| assetVolOutNorm | String |
| assetFeeVolNorm | String |
| assetTotalVolInNorm | String |
| assetTotalVolOutNorm | String |
| assetTotalFeesVolNorm | String |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### AaveFacilitator

| Field | Type |
|-------|------|
| id | ID |
| label | String |
| isRemoved | Boolean |

### AaveFacilitatorHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| facilitator | AaveFacilitator |
| bucketCapacity | BigInt |
| bucketLevel | BigInt |
| paraTimestamp | DateTime |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### BatchHsmpoolAssetHistVolsList

| Field | Type |
|-------|------|
| id | ID |
| assetIds | [String |
| batchStartParaBlockHeight | Int |
| batchEndParaBlockHeight | Int |

### DynamicFeesAssetFeeParameters

| Field | Type |
|-------|------|
| minFee | Int |
| maxFee | Int |
| decay | String |
| amplification | String |

### ConstantsHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| lbpRepayFee | [Int |
| lbpMaxInRatio | BigInt? |
| lbpMaxOutRatio | BigInt? |
| lbpMinPoolLiquidity | BigInt? |
| lbpMinTradingLimit | BigInt? |
| omnipoolBurnProtocolFee | Int? |
| omnipoolHdxAssetId | Int? |
| omnipoolHubAssetId | Int? |
| omnipoolMaxInRatio | BigInt? |
| omnipoolMaxOutRatio | BigInt? |
| omnipoolMinimumPoolLiquidity | BigInt? |
| omnipoolMinimumTradingLimit | BigInt? |
| omnipoolMinWithdrawalFee | Int? |
| stableswapMinTradingLimit | BigInt? |
| stableswapMinPoolLiquidity | BigInt? |
| stableswapAmplificationRange | [Int |
| xykGetExchangeFee | [Int |
| xykMaxInRatio | BigInt? |
| xykMaxOutRatio | BigInt? |
| xykMinPoolLiquidity | BigInt? |
| xykMinTradingLimit | BigInt? |
| xykNativeAssetId | Int? |
| xykOracleSource | String? |
| dynamicFeesAssetFeeParameters | DynamicFeesAssetFeeParameters? |
| dynamicFeesProtocolFeeParameters | DynamicFeesAssetFeeParameters? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### EmaOracleEntryHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| assetA | Asset |
| assetB | Asset |
| assetAAssetRegistryId | String |
| assetBAssetRegistryId | String |
| source | String |
| period | EmaOraclePeriod |
| numeratorPrice | BigInt |
| denominatorPrice | BigInt |
| assetAInVolume | BigInt |
| assetAOutVolume | BigInt |
| assetBInVolume | BigInt |
| assetBOutVolume | BigInt |
| assetALiquidity | BigInt |
| assetBLiquidity | BigInt |
| updatedAtParaBlockHeight | Int |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### DispatchError

| Field | Type |
|-------|------|
| kind | String? |
| index | Int? |
| error | String? |

### DcaSchedule

| Field | Type |
|-------|------|
| id | ID |
| operationId | String? |
| traceIds | [String |
| status | DcaScheduleStatus @index? |
| owner | Account |
| startExecutionBlock | Int? |
| period | Int? |
| totalAmount | BigInt? |
| slippage | Int? |
| maxRetries | Int? |
| stabilityThreshold | Int? |
| totalExecutedAmountIn | BigInt? |
| totalExecutedAmountOut | BigInt? |
| assetIn | Asset? |
| amountIn | BigInt? |
| maxAmountIn | BigInt? |
| assetOut | Asset? |
| amountOut | BigInt? |
| minAmountOut | BigInt? |
| orderType | DcaScheduleOrderType |
| orderRouteHops | [DcaScheduleOrderRouteHop] @derivedFrom(field: "schedule")? |
| executions | [DcaScheduleExecution] @derivedFrom(field: "schedule")? |
| events | [DcaScheduleEvent |
| field | "schedule")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### DcaScheduleOrderRouteHop

| Field | Type |
|-------|------|
| id | ID |
| schedule | DcaSchedule |
| poolKind | SwapFillerType? |
| assetIn | Asset? |
| assetOut | Asset? |

### DcaScheduleEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| schedule | DcaSchedule |
| eventName | DcaScheduleStatus |
| errorState | DispatchError? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### DcaScheduleExecution

| Field | Type |
|-------|------|
| id | ID |
| schedule | DcaSchedule |
| status | DcaScheduleExecutionStatus @index? |
| amountOut | BigInt? |
| amountIn | BigInt? |
| events | [DcaScheduleExecutionEvent] @derivedFrom(field: "scheduleExecution")? |

### DcaScheduleExecutionEvent

| Field | Type |
|-------|------|
| id | ID |
| operationIds | [String]? |
| traceIds | [String |
| scheduleExecution | DcaScheduleExecution |
| swaps | [Swap] @derivedFrom(field: "dcaScheduleExecutionEvent")? |
| eventName | DcaScheduleExecutionStatus @index? |
| errorState | DispatchError? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### OtcOrder

| Field | Type |
|-------|------|
| id | ID |
| owner | Account |
| assetIn | Asset |
| assetOut | Asset |
| amountOut | BigInt |
| amountIn | BigInt |
| partiallyFillable | Boolean? |
| status | OtcOrderStatus @index? |
| totalFilledAmountIn | BigInt? |
| totalFilledAmountOut | BigInt? |
| events | [OtcOrderEvent] @derivedFrom(field: "order")? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### OtcOrderEvent

| Field | Type |
|-------|------|
| id | ID |
| operationId | String @index? |
| traceIds | [String |
| order | OtcOrder |
| eventName | OtcOrderStatus @index? |
| amountIn | BigInt? |
| amountOut | BigInt? |
| fee | BigInt? |
| filler | Account? |
| swap | Swap? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### Aavepool

| Field | Type |
|-------|------|
| id | ID |
| reserveAsset | Asset |
| aToken | Asset |
| moneyMarketReserve | MoneyMarketReserve? |
| historicalData | [AavepoolHistoricalData |
| field | "pool")? |

### AavepoolHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| pool | Aavepool |
| reserveAsset | Asset? |
| reserveAssetRegistryId | String? |
| aToken | Asset? |
| aTokenRegistryId | String? |
| liquidityIn | BigInt |
| liquidityOut | BigInt |
| tvlInRefAssetNorm | String? |
| aTokenTotalSupply | BigInt? |
| variableDebtTokenTotalSupply | BigInt? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### MmSupply

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| asset | Asset |
| account | Account |
| accountOnBehalfOf | Account |
| amount | BigInt? |
| referralCode | BigInt? |
| initiatedByTrade | RoutedTrade? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmWithdraw

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| asset | Asset |
| accountFrom | Account |
| accountTo | Account |
| amount | BigInt? |
| initiatedByTrade | RoutedTrade? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmBorrow

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| asset | Asset |
| account | Account |
| accountOnBehalfOf | Account |
| amount | BigInt? |
| interestRateMode | Int? |
| borrowRate | BigInt? |
| referralCode | BigInt? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmUserEModeSet

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| account | Account |
| categoryId | Int? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmRepay

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| asset | Asset |
| account | Account |
| repayerAccount | Account |
| amount | BigInt? |
| useATokens | Boolean? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmLiquidationCall

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| collateralAsset | Asset |
| debtAsset | Asset |
| account | Account |
| debtToCoverAmount | BigInt? |
| liquidatedCollateralAmount | BigInt? |
| liquidatorAccount | Account |
| receiveAToken | Boolean |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmReserveUsedAsCollateralEnabledEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| account | Account |
| asset | Asset |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MmReserveUsedAsCollateralDisabledEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| account | Account |
| asset | Asset |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MoneyMarketEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| contractName | EvmContractName? |
| eventName | EvmEventName? |
| allInvolvedAssetIds | [String |
| allInvolvedAssetRegistryIds | [String |
| allInvolvedAssetDetails | String @index? |
| allInvolvedParticipants | [String |
| transfer | Transfer? |
| supply | MmSupply? |
| withdraw | MmWithdraw? |
| borrow | MmBorrow? |
| repay | MmRepay? |
| userEModeSet | MmUserEModeSet? |
| liquidationCall | MmLiquidationCall? |
| reserveUsedAsCollateralEnabled | MmReserveUsedAsCollateralEnabledEvent? |
| reserveUsedAsCollateralDisabled | MmReserveUsedAsCollateralDisabledEvent? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| event | Event |

### MoneyMarketReserve

| Field | Type |
|-------|------|
| id | ID |
| aToken | Asset |
| underlyingAsset | Asset |
| variableDebtToken | Asset |
| aavePool | Aavepool? |
| name | String |
| symbol | String |
| decimals | Int |
| indexesHistoricalData | [MmReserveIndexesHistoricalData] |
| field | "reserve")? |
| configHistoricalData | [MmReserveConfigHistoricalData] |
| field | "reserve")? |

### MmReserveConfigHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| reserve | MoneyMarketReserve |
| interestRateStrategyAddress | String |
| priceOracle | String? |
| reserveFactor | BigInt? |
| usageAsCollateralEnabled | Boolean? |
| borrowingEnabled | Boolean? |
| isActive | Boolean? |
| isFrozen | Boolean? |
| isPaused | Boolean? |
| isSiloedBorrowing | Boolean? |
| accruedToTreasury | BigInt? |
| unbacked | BigInt? |
| flashLoanEnabled | Boolean? |
| debtCeiling | BigInt? |
| debtCeilingDecimals | BigInt? |
| eModeCategoryId | Int? |
| borrowCap | BigInt? |
| supplyCap | BigInt? |
| borrowableInIsolation | Boolean? |
| baseLTVasCollateral | BigInt? |
| reserveLiquidationThreshold | BigInt? |
| reserveLiquidationBonus | BigInt? |
| variableRateSlope1 | BigInt? |
| variableRateSlope2 | BigInt? |
| baseVariableBorrowRate | BigInt? |
| optimalUsageRatio | BigInt? |
| lastUpdateTimestamp | DateTime? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### MmReserveIndexesHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| reserve | MoneyMarketReserve |
| liquidityRate | BigInt? |
| variableBorrowRate | BigInt? |
| liquidityIndex | BigInt? |
| variableBorrowIndex | BigInt? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |
| block | Block |

### NftCollection

| Field | Type |
|-------|------|
| id | ID |
| collectionType | String |
| ownerId | String |
| issuerId | String |
| adminId | String |
| freezerId | String |
| totalDeposit | BigInt |
| freeHolding | Boolean |
| isFrozen | Boolean |
| items | Int |
| itemMetadatas | Int |
| attributes | Int |
| maxSupply | BigInt? |

### NftAsset

| Field | Type |
|-------|------|
| id | ID |
| collectionId | String |
| ownerId | String |
| deposit | BigInt |
| isFrozen | Boolean |

### FarmLifeState

| Field | Type |
|-------|------|
| eventName | FarmLifeStateEventName |
| eventId | String? |
| paraBlockHeight | Int |
| relayBlockHeight | Int |

### YieldFarmLoyaltyCurve

| Field | Type |
|-------|------|
| initialRewardPercentage | String |
| scaleCoef | Int |

### OmnipoolLiquidityPosition

| Field | Type |
|-------|------|
| id | ID |
| account | Account |
| assetId | String |
| omnipoolAssetId | String |
| initialAmount | BigInt |
| amount | BigInt |
| sharesAmount | BigInt |
| nftId | String? |
| price | BigInt? |
| status | OmnipoolLiquidityPositionStatus |
| positionEvents | [OmnipoolLiquidityPositionEvent] |
| field | "position")? |
| createdAtParaBlockHeight | Int |
| destroyedAtParaBlockHeight | Int @index? |
| eventId | String? |

### OmnipoolLiquidityPositionEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| position | OmnipoolLiquidityPosition |
| eventName | OmnipoolLiquidityPositionStatus |
| accountId | String? |
| assetId | String? |
| amount | BigInt? |
| sharesAmount | BigInt? |
| price | BigInt? |
| paraBlockHeight | Int |
| eventId | String |

### OmnipoolAssetLiquidityEvent

| Field | Type |
|-------|------|
| id | ID |
| traceIds | [String |
| assetId | String |
| actionType | LiquidityActionEvent |
| accountId | String |
| positionId | String |
| positionEvent | OmnipoolLiquidityPositionEvent? |
| amount | BigInt |
| fee | BigInt? |
| paraBlockHeight | Int |
| eventId | String |

### OmnipoolGlobalFarm

| Field | Type |
|-------|------|
| id | ID |
| ownerAccountId | String |
| updatedAtRelayBlock | Int |
| totalSharesZ | BigInt |
| accumulatedRpz | BigInt |
| rewardAssetId | String |
| pendingRewards | BigInt |
| accumulatedPaidRewards | BigInt |
| yieldPerPeriod | BigInt |
| plannedYieldingPeriods | Int |
| blocksPerPeriod | Int |
| incentivizedAssetId | String |
| maxRewardPerPeriod | BigInt |
| minDeposit | BigInt |
| liveYieldFarmsCount | Int |
| totalYieldFarmsCount | Int |
| priceAdjustment | BigInt |
| state | FarmState |
| lrnaPriceAdjustment | BigInt |
| totalRewards | BigInt |
| lifeStates | [FarmLifeState |
| paraBlockHeight | Int |
| eventId | String? |

### OmnipoolYieldFarm

| Field | Type |
|-------|------|
| id | ID |
| globalFarmId | String |
| assetId | String |
| updatedAtRelayBlock | Int |
| totalShares | BigInt |
| totalValuedShares | BigInt |
| accumulatedRpvs | BigInt |
| accumulatedRpz | BigInt |
| multiplier | BigInt |
| state | FarmState |
| entriesCount | Int |
| leftToDistribute | BigInt |
| totalStopped | BigInt |
| loyaltyCurve | YieldFarmLoyaltyCurve? |
| lifeStates | [FarmLifeState |
| paraBlockHeight | Int |
| eventId | String? |

### OmnipoolYieldFarmDeposit

| Field | Type |
|-------|------|
| id | ID |
| nftId | String? |
| positionId | String |
| accountId | String |
| assetId | String |
| status | YieldFarmDepositStatus |
| sharesAmount | BigInt |
| initialSharesAmount | BigInt |
| entries | [OmnipoolYieldFarmEntry |
| createdAtParaBlockHeight | Int |
| destroyedAtParaBlockHeight | Int @index? |

### OmnipoolYieldFarmDepositEvent

| Field | Type |
|-------|------|
| id | ID |
| depositId | String |
| eventName | YieldFarmDepositStatus |
| globalFarmId | String? |
| yieldFarmId | String? |
| assetId | String? |
| accountId | String? |
| sharesAmount | BigInt? |
| claimedAmount | BigInt? |
| rewardAssetId | String? |
| paraBlockHeight | Int |
| eventId | String? |

### OmnipoolYieldFarmEntry

| Field | Type |
|-------|------|
| id | ID |
| globalFarmId | String |
| yieldFarmId | String |
| valuedShares | String |
| accumulatedRpvs | String |
| accumulatedClaimedRewards | String |
| enteredAtRelayBlock | String |
| updatedAtRelayBlock | String |
| stoppedAtCreation | String |

### XykGlobalFarm

| Field | Type |
|-------|------|
| id | ID |
| ownerAccountId | String |
| updatedAtRelayBlock | Int? |
| totalSharesZ | BigInt? |
| totalRewards | BigInt? |
| accumulatedRpz | BigInt? |
| rewardAssetId | String? |
| pendingRewards | BigInt? |
| accumulatedPaidRewards | BigInt? |
| yieldPerPeriod | Int? |
| plannedYieldingPeriods | Int? |
| blocksPerPeriod | Int? |
| incentivizedAssetId | String? |
| maxRewardPerPeriod | BigInt? |
| minDeposit | BigInt? |
| liveYieldFarmsCount | Int? |
| totalYieldFarmsCount | Int? |
| priceAdjustment | BigInt? |
| state | FarmState |
| yieldFarms | [XykYieldFarm] @derivedFrom(field: "globalFarm")? |
| lifeStates | [FarmLifeState |
| paraBlockHeight | Int |
| eventId | String? |

### XykYieldFarm

| Field | Type |
|-------|------|
| id | ID |
| globalFarm | XykGlobalFarm |
| allInvolvedAssetIds | [String |
| allInvolvedAssetRegistryIds | [String |
| xykpoolId | String |
| state | FarmState |
| updatedAtRelayBlock | Int |
| totalShares | BigInt |
| totalValuedShares | BigInt |
| accumulatedRpvs | BigInt |
| accumulatedRpz | BigInt |
| multiplier | BigInt |
| entriesCount | Int |
| leftToDistribute | BigInt |
| totalStopped | BigInt |
| loyaltyCurve | YieldFarmLoyaltyCurve? |
| lifeStates | [FarmLifeState |
| paraBlockHeight | Int |
| eventId | String? |

### XykYieldFarmDeposit

| Field | Type |
|-------|------|
| id | ID |
| nftId | String? |
| xykpoolId | String |
| accountId | String |
| lpAssetId | String |
| initialAmount | BigInt |
| amount | BigInt |
| status | YieldFarmDepositStatus |
| entries | [XykYieldFarmEntry |
| createdAtParaBlockHeight | Int |
| destroyedAtParaBlockHeight | Int @index? |

### XykYieldFarmEntry

| Field | Type |
|-------|------|
| id | String |
| depositId | String |
| globalFarmId | String |
| yieldFarmId | String |
| valuedShares | String |
| accumulatedRpvs | String |
| accumulatedClaimedRewards | String |
| enteredAtRelayBlock | String |
| updatedAtRelayBlock | String |
| stoppedAtCreation | String |

### XykYieldFarmDepositEvent

| Field | Type |
|-------|------|
| id | ID |
| depositId | String |
| eventName | YieldFarmDepositStatus |
| globalFarmId | String? |
| yieldFarmId | String? |
| lpAssetId | String? |
| accountId | String? |
| amount | BigInt? |
| claimedAmount | BigInt? |
| rewardAssetId | String? |
| paraBlockHeight | Int |
| eventId | String? |

### TransactionPaymentHistoricalData

| Field | Type |
|-------|------|
| id | ID |
| nextFeeMultiplier | BigInt? |
| paraBlockHeight | Int |
| block | Block |


</details>
