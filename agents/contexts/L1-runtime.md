# L1: Runtime Context

> **Auto-generated** - Do not edit manually.
> Extracted: 2025-12-26T00:26:35.149Z
> Commit: `4ca470c` (master)

## Summary

| Metric | Count |
|--------|-------|
| Pallets | 38 |
| Storage Items | 115 |
| Extrinsics | 16 |
| Events | 45 |
| Node Files | 14 |
| Precompiles | 3 |

## Pallets

### asset-registry

**Package:** `pallet-asset-registry`
**Path:** `repos/hydration-node/pallets/asset-registry`

#### Storage (7)
- `Assets`: map
- `NextAssetId`: value
- `AssetIds`: value
- `AssetLocations`: value
- `BannedAssets`: map
- `LocationAssets`: value
- `ExistentialDepositCounter`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `ExistentialDepositPaid`

### bonds

**Package:** `pallet-bonds`
**Path:** `repos/hydration-node/pallets/bonds`

#### Storage (2)
- `BondIds`: map
- `Bonds`: map

#### Extrinsics (0)
_None_

#### Events (1)
- `TokenCreated`

### broadcast

**Package:** `pallet-broadcast`
**Path:** `repos/hydration-node/pallets/broadcast`

#### Storage (3)
- `IncrementalId`: value
- `ExecutionContext`: value
- `Swapper`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `Swapped3`

### circuit-breaker

**Package:** `pallet-circuit-breaker`
**Path:** `repos/hydration-node/pallets/circuit-breaker`

#### Storage (7)
- `TradeVolumeLimitPerAsset`: value
- `AllowedTradeVolumeLimitPerAsset`: value
- `LiquidityAddLimitPerAsset`: value
- `AllowedAddLiquidityAmountPerAsset`: value
- `AssetLockdownState`: value
- `LiquidityRemoveLimitPerAsset`: value
- `AllowedRemoveLiquidityAmountPerAsset`: value

#### Extrinsics (1)
- `set_trade_volume_limit(asset_id, trade_volume_limit)`

#### Events (1)
- `TradeVolumeLimitChanged`

### claims

**Package:** `pallet-claims`
**Path:** `repos/hydration-node/pallets/claims`

#### Storage (1)
- `Claims`: map

#### Extrinsics (1)
- `claim(ethereum_signature)`

#### Events (1)
- `Claim`

### collator-rewards

**Package:** `pallet-collator-rewards`
**Path:** `repos/hydration-node/pallets/collator-rewards`

#### Storage (1)
- `Collators`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `CollatorRewarded`

### currencies

**Package:** `pallet-currencies`
**Path:** `repos/hydration-node/pallets/currencies`

#### Storage (0)
_None_

#### Extrinsics (1)
- `transfer(dest, currency_id, pallet)`

#### Events (1)
- `Transferred`

### dca

**Package:** `pallet-dca`
**Path:** `repos/hydration-node/pallets/dca`

#### Storage (7)
- `ScheduleIdSequencer`: value
- `Schedules`: value
- `ScheduleOwnership`: value
- `RemainingAmounts`: map
- `RetriesOnError`: map
- `ScheduleExecutionBlock`: value
- `ScheduleIdsPerBlock`: value

#### Extrinsics (0)
_None_

#### Events (2)
- `ExecutionStarted`
- `Scheduled`

### democracy

**Package:** `pallet-democracy`
**Path:** `repos/hydration-node/pallets/democracy`

#### Storage (12)
- `PublicPropCount`: value
- `PublicProps`: value
- `DepositOf`: value
- `ReferendumCount`: value
- `LowestUnbaked`: value
- `ReferendumInfoOf`: value
- `VotingOf`: map
- `LastTabledWasExternal`: value
- `NextExternal`: value
- `Blacklist`: value
- `Cancellations`: map
- `MetadataOf`: map

#### Extrinsics (1)
- `propose(proposal, pallet)`

#### Events (1)
- `Proposed`

### dispatcher

**Package:** `pallet-dispatcher`
**Path:** `repos/hydration-node/pallets/dispatcher`

#### Storage (3)
- `AaveManagerAccount`: value
- `ExtraGas`: value
- `LastEvmCallExitReason`: value

#### Extrinsics (1)
- `dispatch_as_treasury(call)`

#### Events (1)
- `TreasuryManagerCallDispatched`

### dispenser

**Package:** `pallet-dispenser`
**Path:** `repos/hydration-node/pallets/dispenser`

#### Storage (3)
- `DispenserConfig`: value
- `FaucetBalanceWei`: value
- `UsedRequestIds`: map

#### Extrinsics (0)
_None_

#### Events (1)
- `FundRequested`

### duster

**Package:** `pallet-duster`
**Path:** `repos/hydration-node/pallets/duster`

#### Storage (1)
- `AccountWhitelist`: map

#### Extrinsics (1)
- `dust_account(account, currency_id)`

#### Events (3)
- `Dusted`
- `Added`
- `Removed`

### dynamic-evm-fee

**Package:** `pallet-dynamic-evm-fee`
**Path:** `repos/hydration-node/pallets/dynamic-evm-fee`

#### Storage (1)
- `BaseFeePerGas`: value

#### Extrinsics (0)
_None_

#### Events (0)
_None_

### dynamic-fees

**Package:** `pallet-dynamic-fees`
**Path:** `repos/hydration-node/pallets/dynamic-fees`

#### Storage (2)
- `AssetFee`: value
- `AssetFeeConfiguration`: value

#### Extrinsics (1)
- `set_asset_fee(asset_id, config)`

#### Events (1)
- `AssetFeeConfigSet`

### ema-oracle

**Package:** `pallet-ema-oracle`
**Path:** `repos/hydration-node/pallets/ema-oracle`

#### Storage (3)
- `Accumulator`: value
- `Oracles`: n_map
- `WhitelistedAssets`: value

#### Extrinsics (1)
- `add_oracle(source, assets)`

#### Events (2)
- `AddedToWhitelist`
- `RemovedFromWhitelist`

### evm-accounts

**Package:** `pallet-evm-accounts`
**Path:** `repos/hydration-node/pallets/evm-accounts`

#### Storage (4)
- `AccountExtension`: map
- `ContractDeployer`: map
- `ApprovedContract`: map
- `MarkedEvmAccounts`: map

#### Extrinsics (1)
- `bind_evm_address()`

#### Events (6)
- `Bound`
- `DeployerAdded`
- `DeployerRemoved`
- `ContractApproved`
- `ContractDisapproved`
- `AccountClaimed`

### genesis-history

**Package:** `pallet-genesis-history`
**Path:** `repos/hydration-node/pallets/genesis-history`

#### Storage (1)
- `PreviousChain`: value

#### Extrinsics (0)
_None_

#### Events (0)
_None_

### hsm

**Package:** `pallet-hsm`
**Path:** `repos/hydration-node/pallets/hsm`

#### Storage (3)
- `Collaterals`: map
- `HollarAmountReceived`: map
- `FlashMinter`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `CollateralAdded`

### lbp

**Package:** `pallet-lbp`
**Path:** `repos/hydration-node/pallets/lbp`

#### Storage (2)
- `PoolData`: value
- `FeeCollectorWithAsset`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `PoolCreated`

### liquidation

**Package:** `pallet-liquidation`
**Path:** `repos/hydration-node/pallets/liquidation`

#### Storage (1)
- `BorrowingContract`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `Liquidated`

### liquidity-mining

**Package:** `pallet-liquidity-mining`
**Path:** `repos/hydration-node/pallets/liquidity-mining`

#### Storage (6)
- `FarmSequencer`: value
- `DepositSequencer`: value
- `GlobalFarm`: value
- `YieldFarm`: n_map
- `Deposit`: value
- `ActiveYieldFarm`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `GlobalFarmAccRPZUpdated`

### nft

**Package:** `pallet-nft`
**Path:** `repos/hydration-node/pallets/nft`

#### Storage (2)
- `Collections`: map
- `Items`: value

#### Extrinsics (1)
- `create_collection(collection_id, collection_type, metadata)`

#### Events (1)
- `CollectionCreated`

### omnipool

**Package:** `pallet-omnipool`
**Path:** `repos/hydration-node/pallets/omnipool`

#### Storage (4)
- `Assets`: map
- `HubAssetTradability`: value
- `Positions`: value
- `NextPositionId`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `TokenAdded`

### omnipool-liquidity-mining

**Package:** `pallet-omnipool-liquidity-mining`
**Path:** `repos/hydration-node/pallets/omnipool-liquidity-mining`

#### Storage (1)
- `OmniPositionId`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `GlobalFarmCreated`

### otc

**Package:** `pallet-otc`
**Path:** `repos/hydration-node/pallets/otc`

#### Storage (2)
- `NextOrderId`: value
- `Orders`: map

#### Extrinsics (0)
_None_

#### Events (2)
- `Cancelled`
- `Filled`

### otc-settlements

**Package:** `pallet-otc-settlements`
**Path:** `repos/hydration-node/pallets/otc-settlements`

#### Storage (0)
_None_

#### Extrinsics (0)
_None_

#### Events (1)
- `Executed`

### parameters

**Package:** `pallet-parameters`
**Path:** `repos/hydration-node/pallets/parameters`

#### Storage (1)
- `IsTestnet`: value

#### Extrinsics (0)
_None_

#### Events (0)
_None_

### referrals

**Package:** `pallet-referrals`
**Path:** `repos/hydration-node/pallets/referrals`

#### Storage (9)
- `ReferralCodes`: value
- `ReferralAccounts`: value
- `LinkedAccounts`: map
- `ReferrerShares`: map
- `TraderShares`: map
- `TotalShares`: value
- `Referrer`: map
- `AssetRewards`: value
- `PendingConversions`: map

#### Extrinsics (2)
- `register_code(code)`
- `trade(asset_in, asset_out, amount)`

#### Events (2)
- `CodeRegistered`
- `Ok`

### relaychain-info

**Package:** `pallet-relaychain-info`
**Path:** `repos/hydration-node/pallets/relaychain-info`

#### Storage (0)
_None_

#### Extrinsics (0)
_None_

#### Events (1)
- `CurrentBlockNumbers`

### route-executor

**Package:** `pallet-route-executor`
**Path:** `repos/hydration-node/pallets/route-executor`

#### Storage (1)
- `Routes`: map

#### Extrinsics (0)
_None_

#### Events (1)
- `Executed`

### signet

**Package:** `pallet-signet`
**Path:** `repos/hydration-node/pallets/signet`

#### Storage (3)
- `Admin`: value
- `SignatureDeposit`: value
- `ChainId`: value

#### Extrinsics (2)
- `initialize(admin, signature_deposit, chain_id, T)`
- `call_signet()`

#### Events (1)
- `Initialized`

### stableswap

**Package:** `pallet-stableswap`
**Path:** `repos/hydration-node/pallets/stableswap`

#### Storage (5)
- `Pools`: map
- `PoolPegs`: value
- `AssetTradability`: value
- `PoolSnapshots`: value
- `BlockFee`: map

#### Extrinsics (0)
_None_

#### Events (1)
- `PoolCreated`

### staking

**Package:** `pallet-staking`
**Path:** `repos/hydration-node/pallets/staking`

#### Storage (8)
- `Staking`: value
- `Positions`: value
- `NextPositionId`: value
- `Votes`: value
- `VotesRewarded`: double_map
- `PositionVotes`: value
- `ProcessedVotes`: double_map
- `SixSecBlocksSince`: value

#### Extrinsics (1)
- `initialize_staking()`

#### Events (1)
- `PositionCreated`

### transaction-multi-payment

**Package:** `pallet-transaction-multi-payment`
**Path:** `repos/hydration-node/pallets/transaction-multi-payment`

#### Storage (4)
- `AccountCurrencyMap`: map
- `AcceptedCurrencies`: map
- `AcceptedCurrencyPrice`: map
- `TransactionCurrencyOverride`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `CurrencySet`

### transaction-pause

**Package:** `pallet-transaction-pause`
**Path:** `repos/hydration-node/pallets/transaction-pause`

#### Storage (1)
- `PausedTransactions`: map

#### Extrinsics (1)
- `pause_transaction(pallet_name, function_name)`

#### Events (1)
- `TransactionPaused`

### xcm-rate-limiter

**Package:** `pallet-xcm-rate-limiter`
**Path:** `repos/hydration-node/pallets/xcm-rate-limiter`

#### Storage (1)
- `AccumulatedAmounts`: value

#### Extrinsics (0)
_None_

#### Events (0)
_None_

### xyk

**Package:** `pallet-xyk`
**Path:** `repos/hydration-node/pallets/xyk`

#### Storage (3)
- `ShareToken`: map
- `TotalLiquidity`: map
- `PoolAssets`: value

#### Extrinsics (0)
_None_

#### Events (1)
- `LiquidityAdded`

### xyk-liquidity-mining

**Package:** `pallet-xyk-liquidity-mining`
**Path:** `repos/hydration-node/pallets/xyk-liquidity-mining`

#### Storage (0)
_None_

#### Extrinsics (0)
_None_

#### Events (1)
- `GlobalFarmCreated`


## EVM

### Precompiles
- call-permit
- flash-loan
- utils

## Node Implementation

Files: 14
- `node/src/cli.rs`
- `node/src/command.rs`
- `node/src/lib.rs`
- `node/src/liquidation_worker.rs`
- `node/src/main.rs`
- `node/src/rpc.rs`
- `node/src/service.rs`
- `node/src/chain_spec/hydradx.rs`
- `node/src/chain_spec/local.rs`
- `node/src/chain_spec/mod.rs`
- `node/src/chain_spec/moonbase.rs`
- `node/src/chain_spec/rococo.rs`
- `node/src/chain_spec/staging.rs`
- `node/src/service/evm.rs`


