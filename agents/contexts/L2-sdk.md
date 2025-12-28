# L2: SDK Context

> **Auto-generated** - Do not edit manually.
> Extracted: 2025-12-27T22:45:47.825Z
> Commit: `f8d2c93` (master)

## Summary

| Metric | Count |
|--------|-------|
| Packages | 20 |
| Methods | 1232 |
| Types | 651 |
| TX Calls | 15 unique |
| Query Calls | 66 unique |
| Const Calls | 20 unique |

## Packages

### @galacticcouncil/common

**Version:** 0.1.3
**Methods:** 15
**Types:** 2

### @galacticcouncil/descriptors

**Version:** 1.7.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-ema

**Version:** 1.2.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-hsm

**Version:** 1.1.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-lbp

**Version:** 1.2.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-liquidity-mining

**Version:** 1.2.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-omnipool

**Version:** 1.3.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-stableswap

**Version:** 2.4.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-staking

**Version:** 1.2.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/math-xyk

**Version:** 1.2.0
**Methods:** 0
**Types:** 0

### @galacticcouncil/sdk

**Version:** 10.4.0
**Methods:** 275
**Types:** 123

### @galacticcouncil/sdk-next

**Version:** 0.24.0
**Methods:** 363
**Types:** 159

### @galacticcouncil/xc

**Version:** 0.4.0
**Methods:** 1
**Types:** 2

### @galacticcouncil/xc-cfg

**Version:** 0.4.2
**Methods:** 86
**Types:** 19

### @galacticcouncil/xc-core

**Version:** 0.5.0
**Methods:** 88
**Types:** 102

### xc-scan

**Version:** unknown
**Methods:** 27
**Types:** 19

### @galacticcouncil/xc-sdk

**Version:** 0.4.1
**Methods:** 101
**Types:** 53

### @galacticcouncil/xcm-cfg

**Version:** 10.19.0
**Methods:** 79
**Types:** 19

### @galacticcouncil/xcm-core

**Version:** 8.9.0
**Methods:** 96
**Types:** 100

### @galacticcouncil/xcm-sdk

**Version:** 10.10.0
**Methods:** 101
**Types:** 53


## Pallet Dependencies

The SDK interacts with these runtime pallets:

### assetRegistry


**Storage:** `assetLocations`, `assetMetadataMap`, `assets`


### AssetRegistry


**Storage:** `AssetLocations`, `Assets`


### assets


**Storage:** `account`, `asset`, `metadata`


### aura



**Constants:** `slotDuration`

### balances



**Constants:** `existentialDeposit`

### bonds


**Storage:** `bonds`


### Bonds


**Storage:** `Bonds`


### dca

**Extrinsics:** `schedule`

**Constants:** `minBudgetInNativeCurrency`

### DCA

**Extrinsics:** `schedule`



### dispatcher

**Extrinsics:** `dispatchWithExtraGas`



### Dispatcher

**Extrinsics:** `dispatch_with_extra_gas`



### dynamicFees


**Storage:** `assetFee`, `assetFeeConfiguration`
**Constants:** `assetFeeParameters`, `protocolFeeParameters`

### DynamicFees


**Storage:** `AssetFee`, `AssetFeeConfiguration`


### emaOracle


**Storage:** `oracles`


### EmaOracle


**Storage:** `Oracles`


### ethereum


**Storage:** `currentBlock`


### Ethereum


**Storage:** `CurrentBlock`


### ethereumXcm

**Extrinsics:** `transact`



### evmAccounts


**Storage:** `evmAddresses`


### foreignAssets


**Storage:** `asset`


### hsm


**Storage:** `collaterals`
**Constants:** `hollarId`

### HSM


**Storage:** `Collaterals`


### lbp


**Storage:** `poolData`
**Constants:** `maxInRatio`, `maxOutRatio`, `minTradingLimit`, `repayFee`

### LBP


**Storage:** `PoolData`


### multiTransactionPayment


**Storage:** `acceptedCurrencies`, `accountCurrencyMap`


### omnipool

**Extrinsics:** `buy`, `sell`
**Storage:** `assets`, `hubAssetTradability`
**Constants:** `hubAssetId`, `maxInRatio`, `maxOutRatio`, `minimumTradingLimit`

### Omnipool

**Extrinsics:** `buy`, `sell`
**Storage:** `Assets`, `HubAssetTradability`


### omnipoolWarehouseLM


**Storage:** `activeYieldFarm`, `globalFarm`, `yieldFarm`


### OmnipoolWarehouseLM


**Storage:** `ActiveYieldFarm`, `GlobalFarm`, `YieldFarm`


### parachainSystem


**Storage:** `validationData`


### ParachainSystem


**Storage:** `ValidationData`


### Referenda


**Storage:** `ReferendumInfoFor`


### router

**Extrinsics:** `buy`, `sell`, `sellAll`



### Router

**Extrinsics:** `buy`, `sell`, `sell_all`



### stableswap


**Storage:** `assetTradability`, `poolPegs`, `pools`
**Constants:** `minTradingLimit`

### Stableswap


**Storage:** `AssetTradability`, `PoolPegs`, `Pools`


### Staking


**Storage:** `Positions`, `SixSecBlocksSince`, `Staking`, `Votes`


### system


**Storage:** `account`, `number`
**Constants:** `version`

### System


**Storage:** `Account`, `Number`


### tokens


**Storage:** `accounts`, `totalIssuance`


### Tokens


**Storage:** `Accounts`, `TotalIssuance`


### Uniques


**Storage:** `Account`


### xyk


**Storage:** `poolAssets`
**Constants:** `getExchangeFee`, `maxInRatio`, `maxOutRatio`, `minTradingLimit`

### XYK


**Storage:** `PoolAssets`


### xykWarehouseLM


**Storage:** `activeYieldFarm`, `globalFarm`, `yieldFarm`


### XYKWarehouseLM


**Storage:** `ActiveYieldFarm`, `GlobalFarm`, `YieldFarm`


