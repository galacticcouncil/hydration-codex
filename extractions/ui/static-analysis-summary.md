# Static Analysis Summary

Generated: 2025-12-27T00:06:21.093Z

## Statistics

| Metric | Count |
|--------|-------|
| Files analyzed | 693 |
| Hooks found | 270 |
| Runtime calls traced | 204 |
| Stores found | 6 |
| Canonical edges | 214 |

### Edges by Type

| Type | Count | Description |
|------|-------|-------------|
| queries | 83 | Hook → Runtime storage |
| calls | 70 | Hook → Runtime extrinsic |
| reads | 24 | Hook → Store (read) |
| writes | 2 | Hook → Store (write) |
| uses | 35 | Hook → Pallet (SDK call) |


## Stores

| Store | Type | Readers | Writers |
|-------|------|---------|---------|
| useDisplayAssetStore | zustand | 2 | 0 |
| useRpcListStore | zustand | 1 | 0 |
| useProviderRpcUrlStore | zustand | 3 | 0 |
| useToastsStore | zustand | 1 | 1 |
| useTradeSettings | zustand | 15 | 0 |
| useIncreaseStake | zustand | 2 | 1 |

## Sample Edges

### Store Edges (26)

| From | Type | To |
|------|------|-----|
| usePriceSubscriber | reads | useDisplayAssetStore |
| useDisplayAssetsPrice | reads | useDisplayAssetStore |
| useRpcFormSchema | reads | useRpcListStore |
| useSquidUrl | reads | useProviderRpcUrlStore |
| useInvalidateRpcProvider | reads | useProviderRpcUrlStore |
| usePolkadotJSExtrinsicUrl | reads | useProviderRpcUrlStore |
| useToasts | reads | useToastsStore |
| useToasts | writes | useToastsStore |
| useLiquidityMinLimit | reads | useTradeSettings |
| useLiquidityOmnipoolShares | reads | useTradeSettings |
| useAddMoneyMarketOmnipoolLiquidity | reads | useTradeSettings |
| useAddMoneyMarketLiquidity | reads | useTradeSettings |
| useStablepoolAddLiquidity | reads | useTradeSettings |
| useRemoveMoneyMarketLiquidity | reads | useTradeSettings |
| useMinimumTradeAmount | reads | useTradeSettings |

### Runtime Edges (188)

| From | Type | To |
|------|------|-----|
| useInvalidateOnBlock | queries | runtime:pallet:System:storage:Number |
| useOmnipoolFarms | uses | runtime:pallet:farm |
| useIsolatedPoolsFarms | uses | runtime:pallet:farm |
| useIsolatedPoolFarms | uses | runtime:pallet:farm |
| useOmnipoolActiveFarm | uses | runtime:pallet:farm |
| useOraclePrice | queries | runtime:pallet:EmaOracle:storage:Oracles |
| useAcceptedFeePaymentAssets | queries | runtime:pallet:MultiTransactionPayment:storage:AcceptedCurrencies |
| useAcceptedFeePaymentAssets | uses | runtime:pallet:router |
| useSetFeePaymentAsset | calls | runtime:pallet:MultiTransactionPayment:call:set_currency |
| useProviderMetadata | queries | runtime:pallet:System:storage:LastRuntimeUpgrade |
| useStableswap | queries | runtime:pallet:Stableswap:storage:Pools |
| useStableSwapTradability | queries | runtime:pallet:Stableswap:storage:AssetTradability |
| useXykShareTokenEntries | queries | runtime:pallet:XYK:storage:ShareToken |
| useGetClaimAllBorrowRewardsTx | calls | runtime:pallet:EVM:call:call |
| useGetClaimAllBorrowRewardsTx | calls | runtime:pallet:Dispatcher:call:dispatch_evm_call |

## Pallets Used by UI

### Staking

**Queries (16):** VotesRewarded (useClaimStaking), ProcessedVotes (useClaimStaking), Staking (useStakingSupply), Staking (useStakingAPR), Positions (useStakingAPR), Positions (useRewardsCurveData), VotesRewarded (useProcessedVotes), ProcessedVotes (useProcessedVotes), Votes (usePendingVotes), PositionVotes (usePendingVotes)...

**Transactions (3):** stake (useStake), increase_stake (useStake), unstake (useUnstake)

### System

**Queries (13):** Number (useInvalidateOnBlock), LastRuntimeUpgrade (useProviderMetadata), Account (useReferralRewards), Number (useStakingRewards), Number (useClaimStaking), Number (useStakingAPR), Number (useRewardsCurveData), Number (useUnlockableNativeTokens), Number (useClaimAllWalletRewards), Account (useClaimAllWalletRewards)...

**Transactions (0):** 

### farm

**Queries (0):** 

**Transactions (13):** getAllOmnipoolFarms (useOmnipoolFarms), getAllIsolatedFarms (useIsolatedPoolsFarms), getIsolatedFarms (useIsolatedPoolFarms), getOmnipoolFarms (useOmnipoolActiveFarm), getAllOmnipoolFarms (useOmnipoolStablepools), getAllIsolatedFarms (useIsolatedPools), getIsolatedFarms (useAddIsolatedLiquidity), getAllOmnipoolFarms (useCheckJoinOmnipoolFarm), getAllOmnipoolFarms (useAddMoneyMarketOmnipoolLiquidity), getAllOmnipoolFarms (useStablepoolAddLiquidity)...

### Utility

**Queries (0):** 

**Transactions (12):** batch_all (useStake), batch_all (useUnstake), batch_all (useAddMoneyMarketOmnipoolLiquidity), batch_all (useExitDepositFarmsMutation), batch_all (useClaimFarmRewardsMutation), batch_all (useRemoveMultipleXYKPositions), batch_all (useRemoveSingleXYKPosition), batch_all (useRemoveMoneyMarketLiquidity), batch_all (useRemoveSingleOmnipoolPosition), batch_all (useRemoveMultipleOmnipoolPositions)...

### Stableswap

**Queries (5):** Pools (useStableswap), AssetTradability (useStableSwapTradability), AssetTradability (useAddableStablepoolTokens), AssetTradability (useAddMoneyMarketLiquidityWrapper), AssetTradability (useStablepoolAddLiquidity)

**Transactions (6):** add_assets_liquidity (useAddMoneyMarketOmnipoolLiquidity), add_assets_liquidity (useAddMoneyMarketLiquidity), add_assets_liquidity (useStablepoolAddLiquidity), remove_liquidity (useRemoveMoneyMarketLiquidity), remove_liquidity (useStablepoolRemoveLiquidity), remove_liquidity_one_asset (useStablepoolRemoveLiquidity)

### router

**Queries (0):** 

**Transactions (10):** getPools (useAcceptedFeePaymentAssets), getBestSell (useAddMoneyMarketOmnipoolLiquidity), getBestSell (useAddMoneyMarketLiquidity), getBestSell (useRemoveMoneyMarketLiquidity), getBestBuy (useMarketBuyData), getBestSell (useMarketSellData), getBestSell (useCalculateBuyAmount), getBestBuy (useCalculateSellAmount), getBestSell (useSwitchAssets), getBestBuy (useSwitchAssets)

### Referrals

**Queries (9):** TotalShares (useReferralRewards), ReferrerShares (useReferralRewards), TraderShares (useReferralRewards), TotalShares (useClaimAllWalletRewards), ReferrerShares (useClaimAllWalletRewards), TraderShares (useClaimAllWalletRewards), TotalShares (useWalletRewardsSectionData), ReferrerShares (useWalletRewardsSectionData), TraderShares (useWalletRewardsSectionData)

**Transactions (1):** claim_rewards (useClaimAllWalletRewards)

### OmnipoolLiquidityMining

**Queries (0):** 

**Transactions (8):** add_liquidity_and_join_farms (useAddLiquidity), add_liquidity_and_join_farms (useAddMoneyMarketOmnipoolLiquidity), add_liquidity_stableswap_omnipool_and_join_farms (useStablepoolAddLiquidity), withdraw_shares (useExitDepositFarmsMutation), withdraw_shares (useRemoveSingleOmnipoolPosition), withdraw_shares (useRemoveMultipleOmnipoolPositions), claim_rewards (useClaimAllWalletRewards), withdraw_shares (useClaimAllWalletRewards)

### EmaOracle

**Queries (7):** Oracles (useOraclePrice), Oracles (useAddIsolatedLiquidity), Oracles (useCheckJoinOmnipoolFarm), Oracles (useAddMoneyMarketOmnipoolLiquidity), Oracles (useStablepoolAddLiquidity), Oracles (useXYKFarmMinShares), Oracles (useMinOmnipoolFarmJoin)

**Transactions (0):** 

### ParachainSystem

**Queries (7):** ValidationData (useStakingRewards), ValidationData (useClaimStaking), ValidationData (useStakingAPR), ValidationData (useRewardsCurveData), ValidationData (useUnlockableNativeTokens), ValidationData (useClaimAllWalletRewards), ValidationData (useWalletRewardsSectionData)

**Transactions (0):** 

### Timestamp

**Queries (7):** Now (useStakingRewards), Now (useClaimStaking), Now (useStakingAPR), Now (useRewardsCurveData), Now (useUnlockableNativeTokens), Now (useClaimAllWalletRewards), Now (useWalletRewardsSectionData)

**Transactions (0):** 

### staking

**Queries (0):** 

**Transactions (7):** getRewards (useStakingRewards), getRewards (useClaimStaking), getPotBalance (useStakingAPR), getRewards (useStakingAPR), getRewards (useRewardsCurveData), getRewards (useClaimAllWalletRewards), getRewards (useWalletRewardsSectionData)

### scheduler

**Queries (0):** 

**Transactions (7):** getDcaOrder (useDcaTradeOrder), getTwapBuyOrder (useMarketBuyData), getTwapSellOrder (useMarketSellData), getTwapSellOrder (useCalculateBuyAmount), getTwapBuyOrder (useCalculateSellAmount), getTwapSellOrder (useSwitchAssets), getTwapBuyOrder (useSwitchAssets)

### XYK

**Queries (1):** ShareToken (useXykShareTokenEntries)

**Transactions (5):** add_liquidity (useAddIsolatedLiquidity), create_pool (useSubmitCreateIsolatedPool), remove_liquidity_with_limits (useRemoveMultipleXYKPositions), remove_liquidity_with_limits (useRemoveSingleXYKPosition), remove_liquidity_with_limits (useRemoveXYKShares)

### Dispatcher

**Queries (0):** 

**Transactions (6):** dispatch_evm_call (useGetClaimAllBorrowRewardsTx), dispatch_with_extra_gas (useAddMoneyMarketOmnipoolLiquidity), dispatch_with_extra_gas (useAddMoneyMarketLiquidity), dispatch_with_extra_gas (useRemoveMoneyMarketLiquidity), dispatch_with_extra_gas (useSubmitFillOrder), dispatch_with_extra_gas (useSubmitPlaceOrder)

### Tokens

**Queries (4):** Accounts (useReferralRewards), Accounts (useClaimAllWalletRewards), Accounts (useWalletRewardsSectionData), Accounts (useInsufficientTransferFee)

**Transactions (2):** transfer (useTransferPaymentInfo), transfer (useSubmitTransferPosition)

### Referenda

**Queries (6):** ReferendumInfoFor (useStakingRewards), ReferendumInfoFor (useClaimStaking), ReferendumInfoFor (useStakingAPR), ReferendumInfoFor (useRewardsCurveData), ReferendumInfoFor (useClaimAllWalletRewards), ReferendumInfoFor (useWalletRewardsSectionData)

**Transactions (0):** 

### Democracy

**Queries (2):** VotingOf (useUnlockableNativeTokens), ReferendumInfoOf (useUnlockableNativeTokens)

**Transactions (4):** remove_vote (useStake), remove_vote (useUnstake), remove_vote (useUnlockNativeLocks), unlock (useUnlockNativeLocks)

### XYKLiquidityMining

**Queries (0):** 

**Transactions (6):** add_liquidity_and_join_farms (useAddIsolatedLiquidity), withdraw_shares (useExitDepositFarmsMutation), withdraw_shares (useRemoveMultipleXYKPositions), withdraw_shares (useRemoveSingleXYKPosition), claim_rewards (useClaimAllWalletRewards), withdraw_shares (useClaimAllWalletRewards)

### MultiTransactionPayment

**Queries (2):** AcceptedCurrencies (useAcceptedFeePaymentAssets), AcceptedCurrencies (useEstimateFee)

**Transactions (2):** set_currency (useSetFeePaymentAsset), dispatch_permit (useSignAndSubmit)

### Omnipool

**Queries (0):** 

**Transactions (4):** add_liquidity_with_limit (useAddLiquidity), add_liquidity_with_limit (useAddMoneyMarketOmnipoolLiquidity), remove_liquidity_with_limit (useRemoveSingleOmnipoolPosition), remove_liquidity_with_limit (useRemoveMultipleOmnipoolPositions)

### OTC

**Queries (0):** 

**Transactions (4):** cancel_order (useSubmitCancelOtcOrder), partial_fill_order (useSubmitFillOrder), fill_order (useSubmitFillOrder), place_order (useSubmitPlaceOrder)

### EVM

**Queries (0):** 

**Transactions (2):** call (useGetClaimAllBorrowRewardsTx), call (useSignAndSubmit)

### Uniques

**Queries (2):** Account (useStakingAPR), Account (useRewardsCurveData)

**Transactions (0):** 

### ConvictionVoting

**Queries (0):** 

**Transactions (2):** remove_vote (useStake), remove_vote (useUnstake)

### aave

**Queries (0):** 

**Transactions (2):** getHealthFactor (useAddMoneyMarketOmnipoolLiquidity), getHealthFactorAfterWithdraw (useAddMoneyMarketOmnipoolLiquidity)

### Balances

**Queries (2):** Locks (useUnlockNativeLocks), Locks (useNativeAssetLocks)

**Transactions (0):** 

### Currencies

**Queries (0):** 

**Transactions (2):** transfer (useTransferPaymentInfo), transfer (useSubmitTransferPosition)

### DCA

**Queries (0):** 

**Transactions (1):** terminate (useTerminateDcaSchedule)


## Top Hooks by Runtime Calls

| Hook | Calls |
|------|-------|
| useAddMoneyMarketOmnipoolLiquidity | 18 |
| useClaimAllWalletRewards | 16 |
| useStakingAPR | 12 |
| useWalletRewardsSectionData | 10 |
| useUnstake | 8 |
| useClaimStaking | 7 |
| useRewardsCurveData | 7 |
| useStake | 7 |
| useReferralRewards | 5 |
| useStakingRewards | 5 |
| useStablepoolAddLiquidity | 5 |
| useUnlockableNativeTokens | 5 |
| useAddIsolatedLiquidity | 4 |
| useAddMoneyMarketLiquidity | 4 |
| useRemoveMoneyMarketLiquidity | 4 |
| useUnlockNativeLocks | 4 |
| useSwitchAssets | 4 |
| useExitDepositFarmsMutation | 3 |
| useRemoveMultipleXYKPositions | 3 |
| useRemoveSingleXYKPosition | 3 |
