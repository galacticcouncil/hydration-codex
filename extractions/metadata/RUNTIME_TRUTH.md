# Hydration Runtime Truth

> Extracted from live chain at block #10678922
> Spec: hydradx v360
> Extracted: 2025-12-27T00:18:28.248Z

## Statistics

| Metric | Count |
|--------|-------|
| Pallets | 76 |
| Storage Items | 295 |
| Extrinsics | 397 |
| Events | 410 |
| Errors | 683 |

## Pallets

### Hydration Core Pallets (16)

#### Omnipool (index: 59)

**Storage (4)**
| Name | Type |
|------|------|
| Assets | `Map<u32 -> {"hubReserve":"u128","shares":"u128","protocolShares":"u128","cap":"u128","tradable":"PalletOmnipoolTradability"}> [Blake2_128Concat]` |
| HubAssetTradability | `Value<{"bits":"u8"}>` |
| Positions | `Map<u128 -> {"assetId":"u32","amount":"u128","shares":"u128","price":"(u128,u128)"}> [Blake2_128Concat]` |
| NextPositionId | `Value<u128>` |

**Calls (15)**
| Name | Args |
|------|------|
| __Unused0 | `none` |
| add_token | `asset: u32, initialPrice: u128, weightCap: Permill, positionOwner: AccountId32` |
| add_liquidity | `asset: u32, amount: u128` |
| remove_liquidity | `positionId: u128, amount: u128` |
| sacrifice_position | `positionId: u128` |
| sell | `assetIn: u32, assetOut: u32, amount: u128, minBuyAmount: u128` |
| buy | `assetOut: u32, assetIn: u32, amount: u128, maxSellAmount: u128` |
| set_asset_tradable_state | `assetId: u32, state: Lookup201` |
| refund_refused_asset | `assetId: u32, amount: u128, recipient: AccountId32` |
| set_asset_weight_cap | `assetId: u32, cap: Permill` |
| __Unused10 | `none` |
| withdraw_protocol_liquidity | `assetId: u32, amount: u128, price: (u128,u128), dest: AccountId32` |
| remove_token | `assetId: u32, beneficiary: AccountId32` |
| add_liquidity_with_limit | `asset: u32, amount: u128, minSharesLimit: u128` |
| remove_liquidity_with_limit | `positionId: u128, amount: u128, minLimit: u128` |

**Events (13)**
| Name | Fields |
|------|--------|
| TokenAdded | `assetId: u32, initialAmount: u128, initialPrice: u128` |
| TokenRemoved | `assetId: u32, amount: u128, hubWithdrawn: u128` |
| LiquidityAdded | `who: AccountId32, assetId: u32, amount: u128, positionId: u128` |
| LiquidityRemoved | `who: AccountId32, positionId: u128, assetId: u32, sharesRemoved: u128, fee: u128` |
| ProtocolLiquidityRemoved | `who: AccountId32, assetId: u32, amount: u128, hubAmount: u128, sharesRemoved: u128` |
| SellExecuted | `who: AccountId32, assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, hubAmountIn: u128, hubAmountOut: u128, assetFeeAmount: u128, protocolFeeAmount: u128` |
| BuyExecuted | `who: AccountId32, assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, hubAmountIn: u128, hubAmountOut: u128, assetFeeAmount: u128, protocolFeeAmount: u128` |
| PositionCreated | `positionId: u128, owner: AccountId32, asset: u32, amount: u128, shares: u128, price: u128` |
| PositionDestroyed | `positionId: u128, owner: AccountId32` |
| PositionUpdated | `positionId: u128, owner: AccountId32, asset: u32, amount: u128, shares: u128, price: u128` |
| TradableStateUpdated | `assetId: u32, state: Lookup201` |
| AssetRefunded | `assetId: u32, amount: u128, recipient: AccountId32` |
| AssetWeightCapUpdated | `assetId: u32, cap: Permill` |

**Constants (9)**
| Name | Type |
|------|------|
| HdxAssetId | `u32` |
| HubAssetId | `u32` |
| MinWithdrawalFee | `Permill` |
| MinimumTradingLimit | `u128` |
| MinimumPoolLiquidity | `u128` |
| MaxInRatio | `u128` |
| MaxOutRatio | `u128` |
| NFTCollectionId | `u128` |
| BurnProtocolFee | `Permill` |

#### OmnipoolWarehouseLM (index: 62)

**Storage (6)**
| Name | Type |
|------|------|
| FarmSequencer | `Value<u32>` |
| DepositSequencer | `Value<u128>` |
| GlobalFarm | `Map<u32 -> {"id":"u32","owner":"AccountId32","updatedAt":"u32","totalSharesZ":"u128","accumulatedRpz":"u128","rewardCurrency":"u32","pendingRewards":"u128","accumulatedPaidRewards":"u128","yieldPerPeriod":"Perquintill","plannedYieldingPeriods":"u32","blocksPerPeriod":"u32","incentivizedAsset":"u32","maxRewardPerPeriod":"u128","minDeposit":"u128","liveYieldFarmsCount":"u32","totalYieldFarmsCount":"u32","priceAdjustment":"u128","state":"PalletLiquidityMiningFarmState"}> [Blake2_128Concat]` |
| YieldFarm | `Map<(u32,u32,u32) -> {"id":"u32","updatedAt":"u32","totalShares":"u128","totalValuedShares":"u128","accumulatedRpvs":"u128","accumulatedRpz":"u128","loyaltyCurve":"Option<PalletLiquidityMiningLoyaltyCurve>","multiplier":"u128","state":"PalletLiquidityMiningFarmState","entriesCount":"u64","leftToDistribute":"u128","totalStopped":"u32"}> [Blake2_128Concat, Blake2_128Concat, Blake2_128Concat]` |
| Deposit | `Map<u128 -> {"shares":"u128","ammPoolId":"u32","yieldFarmEntries":"Vec<PalletLiquidityMiningYieldFarmEntry>"}> [Twox64Concat]` |
| ActiveYieldFarm | `Map<(u32,u32) -> u32> [Blake2_128Concat, Blake2_128Concat]` |

**Events (3)**
| Name | Fields |
|------|--------|
| GlobalFarmAccRPZUpdated | `globalFarmId: u32, accumulatedRpz: u128, totalSharesZ: u128` |
| YieldFarmAccRPVSUpdated | `globalFarmId: u32, yieldFarmId: u32, accumulatedRpvs: u128, totalValuedShares: u128` |
| AllRewardsDistributed | `globalFarmId: u32` |

**Constants (6)**
| Name | Type |
|------|------|
| PalletId | `[u8;8]` |
| TreasuryAccountId | `AccountId32` |
| MinTotalFarmRewards | `u128` |
| MinPlannedYieldingPeriods | `u32` |
| MaxFarmEntriesPerDeposit | `u32` |
| MaxYieldFarmsPerGlobalFarm | `u32` |

#### OmnipoolLiquidityMining (index: 63)

**Storage (1)**
| Name | Type |
|------|------|
| OmniPositionId | `Map<u128 -> u128> [Blake2_128Concat]` |

**Calls (17)**
| Name | Args |
|------|------|
| create_global_farm | `totalRewards: u128, plannedYieldingPeriods: u32, blocksPerPeriod: u32, rewardCurrency: u32, owner: AccountId32, yieldPerPeriod: Perquintill, minDeposit: u128, lrnaPriceAdjustment: u128` |
| __Unused1 | `none` |
| terminate_global_farm | `globalFarmId: u32` |
| create_yield_farm | `globalFarmId: u32, assetId: u32, multiplier: u128, loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>` |
| update_yield_farm | `globalFarmId: u32, assetId: u32, multiplier: u128` |
| stop_yield_farm | `globalFarmId: u32, assetId: u32` |
| resume_yield_farm | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, multiplier: u128` |
| terminate_yield_farm | `globalFarmId: u32, yieldFarmId: u32, assetId: u32` |
| deposit_shares | `globalFarmId: u32, yieldFarmId: u32, positionId: u128` |
| redeposit_shares | `globalFarmId: u32, yieldFarmId: u32, depositId: u128` |
| claim_rewards | `depositId: u128, yieldFarmId: u32` |
| withdraw_shares | `depositId: u128, yieldFarmId: u32` |
| update_global_farm | `globalFarmId: u32, plannedYieldingPeriods: u32, yieldPerPeriod: Perquintill, minDeposit: u128` |
| join_farms | `farmEntries: Vec<(u32,u32)>, positionId: u128` |
| add_liquidity_and_join_farms | `farmEntries: Vec<(u32,u32)>, asset: u32, amount: u128, minSharesLimit: Option<u128>` |
| exit_farms | `depositId: u128, yieldFarmIds: Vec<u32>` |
| add_liquidity_stableswap_omnipool_and_join_farms | `stablePoolId: u32, stableAssetAmounts: Vec<HydradxTraitsStableswapAssetAmount>, farmEntries: Option<Vec<(u32,u32)>>` |

**Events (13)**
| Name | Fields |
|------|--------|
| GlobalFarmCreated | `id: u32, owner: AccountId32, totalRewards: u128, rewardCurrency: u32, yieldPerPeriod: Perquintill, plannedYieldingPeriods: u32, blocksPerPeriod: u32, maxRewardPerPeriod: u128, minDeposit: u128, lrnaPriceAdjustment: u128` |
| GlobalFarmUpdated | `id: u32, plannedYieldingPeriods: u32, yieldPerPeriod: Perquintill, minDeposit: u128` |
| GlobalFarmTerminated | `globalFarmId: u32, who: AccountId32, rewardCurrency: u32, undistributedRewards: u128` |
| YieldFarmCreated | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, multiplier: u128, loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>` |
| YieldFarmUpdated | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, who: AccountId32, multiplier: u128` |
| YieldFarmStopped | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, who: AccountId32` |
| YieldFarmResumed | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, who: AccountId32, multiplier: u128` |
| YieldFarmTerminated | `globalFarmId: u32, yieldFarmId: u32, assetId: u32, who: AccountId32` |
| SharesDeposited | `globalFarmId: u32, yieldFarmId: u32, depositId: u128, assetId: u32, who: AccountId32, sharesAmount: u128, positionId: u128` |
| SharesRedeposited | `globalFarmId: u32, yieldFarmId: u32, depositId: u128, assetId: u32, who: AccountId32, sharesAmount: u128, positionId: u128` |
| RewardClaimed | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, claimed: u128, rewardCurrency: u32, depositId: u128` |
| SharesWithdrawn | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, amount: u128, depositId: u128` |
| DepositDestroyed | `who: AccountId32, depositId: u128` |

**Constants (3)**
| Name | Type |
|------|------|
| NFTCollectionId | `u128` |
| OracleSource | `[u8;8]` |
| OraclePeriod | `{"_enum":["LastBlock","Short","TenMinutes","Hour","Day","Week"]}` |

#### OTC (index: 64)

**Storage (2)**
| Name | Type |
|------|------|
| NextOrderId | `Value<u32>` |
| Orders | `Map<u32 -> {"owner":"AccountId32","assetIn":"u32","assetOut":"u32","amountIn":"u128","amountOut":"u128","partiallyFillable":"bool"}> [Blake2_128Concat]` |

**Calls (4)**
| Name | Args |
|------|------|
| place_order | `assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, partiallyFillable: bool` |
| partial_fill_order | `orderId: u32, amountIn: u128` |
| fill_order | `orderId: u32` |
| cancel_order | `orderId: u32` |

**Events (4)**
| Name | Fields |
|------|--------|
| Cancelled | `orderId: u32` |
| Filled | `orderId: u32, who: AccountId32, amountIn: u128, amountOut: u128, fee: u128` |
| PartiallyFilled | `orderId: u32, who: AccountId32, amountIn: u128, amountOut: u128, fee: u128` |
| Placed | `orderId: u32, assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, partiallyFillable: bool` |

**Constants (3)**
| Name | Type |
|------|------|
| ExistentialDepositMultiplier | `u8` |
| Fee | `Permill` |
| FeeReceiver | `AccountId32` |

#### CircuitBreaker (index: 65)

**Storage (7)**
| Name | Type |
|------|------|
| TradeVolumeLimitPerAsset | `Map<u32 -> (u32,u32)> [Blake2_128Concat]` |
| AllowedTradeVolumeLimitPerAsset | `Map<u32 -> {"volumeIn":"u128","volumeOut":"u128","limit":"u128"}> [Blake2_128Concat]` |
| LiquidityAddLimitPerAsset | `Map<u32 -> Option<(u32,u32)>> [Blake2_128Concat]` |
| AllowedAddLiquidityAmountPerAsset | `Map<u32 -> {"liquidity":"u128","limit":"u128"}> [Blake2_128Concat]` |
| AssetLockdownState | `Map<u32 -> {"_enum":{"Locked":"u32","Unlocked":"(u32,u128)"}}> [Blake2_128Concat]` |
| LiquidityRemoveLimitPerAsset | `Map<u32 -> Option<(u32,u32)>> [Blake2_128Concat]` |
| AllowedRemoveLiquidityAmountPerAsset | `Map<u32 -> {"liquidity":"u128","limit":"u128"}> [Blake2_128Concat]` |

**Calls (6)**
| Name | Args |
|------|------|
| set_trade_volume_limit | `assetId: u32, tradeVolumeLimit: (u32,u32)` |
| set_add_liquidity_limit | `assetId: u32, liquidityLimit: Option<(u32,u32)>` |
| set_remove_liquidity_limit | `assetId: u32, liquidityLimit: Option<(u32,u32)>` |
| lockdown_asset | `assetId: u32, until: u32` |
| force_lift_lockdown | `assetId: u32` |
| release_deposit | `who: AccountId32, assetId: u32` |

**Events (6)**
| Name | Fields |
|------|--------|
| TradeVolumeLimitChanged | `assetId: u32, tradeVolumeLimit: (u32,u32)` |
| AddLiquidityLimitChanged | `assetId: u32, liquidityLimit: Option<(u32,u32)>` |
| RemoveLiquidityLimitChanged | `assetId: u32, liquidityLimit: Option<(u32,u32)>` |
| AssetLockdown | `assetId: u32, until: u32` |
| AssetLockdownRemoved | `assetId: u32` |
| DepositReleased | `who: AccountId32, assetId: u32` |

**Constants (3)**
| Name | Type |
|------|------|
| DefaultMaxNetTradeVolumeLimitPerBlock | `(u32,u32)` |
| DefaultMaxAddLiquidityLimitPerBlock | `Option<(u32,u32)>` |
| DefaultMaxRemoveLiquidityLimitPerBlock | `Option<(u32,u32)>` |

#### Staking (index: 69)

**Storage (8)**
| Name | Type |
|------|------|
| Staking | `Value<{"totalStake":"u128","accumulatedRewardPerStake":"u128","potReservedBalance":"u128"}>` |
| Positions | `Map<u128 -> {"stake":"u128","actionPoints":"u128","rewardPerStake":"u128","createdAt":"u32","accumulatedSlashPoints":"u128","accumulatedUnpaidRewards":"u128","accumulatedLockedRewards":"u128"}> [Blake2_128Concat]` |
| NextPositionId | `Value<u128>` |
| Votes | `Map<u128 -> {"votes":"Vec<(u32,PalletStakingVote)>"}> [Blake2_128Concat]` |
| VotesRewarded | `Map<(AccountId32,u32) -> {"amount":"u128","conviction":"PalletStakingConviction"}> [Blake2_128Concat, Blake2_128Concat]` |
| PositionVotes | `Map<u128 -> {"votes":"Vec<(u32,PalletStakingVote)>"}> [Blake2_128Concat]` |
| ProcessedVotes | `Map<(AccountId32,u32) -> {"amount":"u128","conviction":"PalletStakingConviction"}> [Blake2_128Concat, Blake2_128Concat]` |
| SixSecBlocksSince | `Value<u32>` |

**Calls (5)**
| Name | Args |
|------|------|
| initialize_staking | `none` |
| stake | `amount: u128` |
| increase_stake | `positionId: u128, amount: u128` |
| claim | `positionId: u128` |
| unstake | `positionId: u128` |

**Events (6)**
| Name | Fields |
|------|--------|
| PositionCreated | `who: AccountId32, positionId: u128, stake: u128` |
| StakeAdded | `who: AccountId32, positionId: u128, stake: u128, totalStake: u128, lockedRewards: u128, slashedPoints: u128, payablePercentage: u128` |
| RewardsClaimed | `who: AccountId32, positionId: u128, paidRewards: u128, unlockedRewards: u128, slashedPoints: u128, slashedUnpaidRewards: u128, payablePercentage: u128` |
| Unstaked | `who: AccountId32, positionId: u128, unlockedStake: u128` |
| StakingInitialized | `nonDustableBalance: u128` |
| AccumulatedRpsUpdated | `accumulatedRps: u128, totalStake: u128` |

**Constants (11)**
| Name | Type |
|------|------|
| PeriodLength | `u32` |
| PalletId | `[u8;8]` |
| NativeAssetId | `u32` |
| MinStake | `u128` |
| TimePointsWeight | `Permill` |
| ActionPointsWeight | `Perbill` |
| TimePointsPerPeriod | `u8` |
| UnclaimablePeriods | `u128` |
| CurrentStakeWeight | `u8` |
| MaxVotes | `u32` |
| NFTCollectionId | `u128` |

#### Stableswap (index: 70)

**Storage (4)**
| Name | Type |
|------|------|
| Pools | `Map<u32 -> {"assets":"Vec<u32>","initialAmplification":"u16","finalAmplification":"u16","initialBlock":"u32","finalBlock":"u32","fee":"Permill"}> [Blake2_128Concat]` |
| PoolPegs | `Map<u32 -> {"source":"Vec<PalletStableswapPegSource>","maxPegUpdate":"Perbill","current":"Vec<(u128,u128)>"}> [Blake2_128Concat]` |
| AssetTradability | `Map<(u32,u32) -> {"bits":"u8"}> [Blake2_128Concat, Blake2_128Concat]` |
| PoolSnapshots | `Map<u32 -> {"assets":"Vec<u32>","reserves":"Vec<HydraDxMathStableswapTypesAssetReserve>","amplification":"u128","fee":"Permill","pegs":"Vec<(u128,u128)>","shareIssuance":"u128"}> [Blake2_128Concat]` |

**Calls (15)**
| Name | Args |
|------|------|
| create_pool | `shareAsset: u32, assets: Vec<u32>, amplification: u16, fee: Permill` |
| update_pool_fee | `poolId: u32, fee: Permill` |
| update_amplification | `poolId: u32, finalAmplification: u16, startBlock: u32, endBlock: u32` |
| add_liquidity | `poolId: u32, assets: Vec<HydradxTraitsStableswapAssetAmount>` |
| add_liquidity_shares | `poolId: u32, shares: u128, assetId: u32, maxAssetAmount: u128` |
| remove_liquidity_one_asset | `poolId: u32, assetId: u32, shareAmount: u128, minAmountOut: u128` |
| withdraw_asset_amount | `poolId: u32, assetId: u32, amount: u128, maxShareAmount: u128` |
| sell | `poolId: u32, assetIn: u32, assetOut: u32, amountIn: u128, minBuyAmount: u128` |
| buy | `poolId: u32, assetOut: u32, assetIn: u32, amountOut: u128, maxSellAmount: u128` |
| set_asset_tradable_state | `poolId: u32, assetId: u32, state: Lookup234` |
| remove_liquidity | `poolId: u32, shareAmount: u128, minAmountsOut: Vec<HydradxTraitsStableswapAssetAmount>` |
| create_pool_with_pegs | `shareAsset: u32, assets: Vec<u32>, amplification: u16, fee: Permill, pegSource: Vec<PalletStableswapPegSource>, maxPegUpdate: Perbill` |
| add_assets_liquidity | `poolId: u32, assets: Vec<HydradxTraitsStableswapAssetAmount>, minShares: u128` |
| update_asset_peg_source | `poolId: u32, assetId: u32, pegSource: Lookup236` |
| update_pool_max_peg_update | `poolId: u32, maxPegUpdate: Perbill` |

**Events (11)**
| Name | Fields |
|------|--------|
| PoolCreated | `poolId: u32, assets: Vec<u32>, amplification: u16, fee: Permill, peg: Option<PalletStableswapPoolPegInfo>` |
| FeeUpdated | `poolId: u32, fee: Permill` |
| LiquidityAdded | `poolId: u32, who: AccountId32, shares: u128, assets: Vec<HydradxTraitsStableswapAssetAmount>` |
| LiquidityRemoved | `poolId: u32, who: AccountId32, shares: u128, amounts: Vec<HydradxTraitsStableswapAssetAmount>, fee: u128` |
| SellExecuted | `who: AccountId32, poolId: u32, assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, fee: u128` |
| BuyExecuted | `who: AccountId32, poolId: u32, assetIn: u32, assetOut: u32, amountIn: u128, amountOut: u128, fee: u128` |
| TradableStateUpdated | `poolId: u32, assetId: u32, state: Lookup234` |
| AmplificationChanging | `poolId: u32, currentAmplification: u16, finalAmplification: u16, startBlock: u32, endBlock: u32` |
| PoolDestroyed | `poolId: u32` |
| PoolPegSourceUpdated | `poolId: u32, assetId: u32, pegSource: Lookup236` |
| PoolMaxPegUpdateUpdated | `poolId: u32, maxPegUpdate: Perbill` |

**Constants (3)**
| Name | Type |
|------|------|
| MinPoolLiquidity | `u128` |
| MinTradingLimit | `u128` |
| AmplificationRange | `RangeInclusive<u16>` |

#### Bonds (index: 71)

**Storage (2)**
| Name | Type |
|------|------|
| BondIds | `Map<(u32,u64) -> u32> [Blake2_128Concat]` |
| Bonds | `Map<u32 -> (u32,u64)> [Blake2_128Concat]` |

**Calls (2)**
| Name | Args |
|------|------|
| issue | `assetId: u32, amount: u128, maturity: u64` |
| redeem | `bondId: u32, amount: u128` |

**Events (3)**
| Name | Fields |
|------|--------|
| TokenCreated | `issuer: AccountId32, assetId: u32, bondId: u32, maturity: u64` |
| Issued | `issuer: AccountId32, bondId: u32, amount: u128, fee: u128` |
| Redeemed | `who: AccountId32, bondId: u32, amount: u128` |

**Constants (3)**
| Name | Type |
|------|------|
| PalletId | `[u8;8]` |
| ProtocolFee | `Permill` |
| FeeReceiver | `AccountId32` |

#### OtcSettlements (index: 72)

**Calls (1)**
| Name | Args |
|------|------|
| settle_otc_order | `otcId: u32, amount: u128, route: Vec<HydradxTraitsRouterTrade>` |

**Events (1)**
| Name | Fields |
|------|--------|
| Executed | `assetId: u32, profit: u128` |

**Constants (5)**
| Name | Type |
|------|------|
| ProfitReceiver | `AccountId32` |
| MinProfitPercentage | `Perbill` |
| PricePrecision | `u128` |
| MinTradingLimit | `u128` |
| MaxIterations | `u32` |

#### LBP (index: 73)

**Storage (2)**
| Name | Type |
|------|------|
| PoolData | `Map<AccountId32 -> {"owner":"AccountId32","start":"Option<u32>","end":"Option<u32>","assets":"(u32,u32)","initialWeight":"u32","finalWeight":"u32","weightCurve":"PalletLbpWeightCurveType","fee":"(u32,u32)","feeCollector":"AccountId32","repayTarget":"u128"}> [Blake2_128Concat]` |
| FeeCollectorWithAsset | `Map<(AccountId32,u32) -> bool> [Blake2_128Concat, Blake2_128Concat]` |

**Calls (6)**
| Name | Args |
|------|------|
| create_pool | `poolOwner: AccountId32, assetA: u32, assetAAmount: u128, assetB: u32, assetBAmount: u128, initialWeight: u32, finalWeight: u32, weightCurve: Lookup244, fee: (u32,u32), feeCollector: AccountId32, repayTarget: u128` |
| update_pool_data | `poolId: AccountId32, poolOwner: Option<AccountId32>, start: Option<u32>, end: Option<u32>, initialWeight: Option<u32>, finalWeight: Option<u32>, fee: Option<(u32,u32)>, feeCollector: Option<AccountId32>, repayTarget: Option<u128>` |
| add_liquidity | `amountA: (u32,u128), amountB: (u32,u128)` |
| remove_liquidity | `poolId: AccountId32` |
| sell | `assetIn: u32, assetOut: u32, amount: u128, maxLimit: u128` |
| buy | `assetOut: u32, assetIn: u32, amount: u128, maxLimit: u128` |

**Events (6)**
| Name | Fields |
|------|--------|
| PoolCreated | `pool: AccountId32, data: Lookup497` |
| PoolUpdated | `pool: AccountId32, data: Lookup497` |
| LiquidityAdded | `who: AccountId32, assetA: u32, assetB: u32, amountA: u128, amountB: u128` |
| LiquidityRemoved | `who: AccountId32, assetA: u32, assetB: u32, amountA: u128, amountB: u128` |
| SellExecuted | `who: AccountId32, assetIn: u32, assetOut: u32, amount: u128, salePrice: u128, feeAsset: u32, feeAmount: u128` |
| BuyExecuted | `who: AccountId32, assetOut: u32, assetIn: u32, amount: u128, buyPrice: u128, feeAsset: u32, feeAmount: u128` |

**Constants (5)**
| Name | Type |
|------|------|
| MinTradingLimit | `u128` |
| MinPoolLiquidity | `u128` |
| MaxInRatio | `u128` |
| MaxOutRatio | `u128` |
| repay_fee | `(u32,u32)` |

#### XYK (index: 74)

**Storage (3)**
| Name | Type |
|------|------|
| ShareToken | `Map<AccountId32 -> u32> [Blake2_128Concat]` |
| TotalLiquidity | `Map<AccountId32 -> u128> [Blake2_128Concat]` |
| PoolAssets | `Map<AccountId32 -> (u32,u32)> [Blake2_128Concat]` |

**Calls (7)**
| Name | Args |
|------|------|
| create_pool | `assetA: u32, amountA: u128, assetB: u32, amountB: u128` |
| add_liquidity | `assetA: u32, assetB: u32, amountA: u128, amountBMaxLimit: u128` |
| remove_liquidity | `assetA: u32, assetB: u32, shareAmount: u128` |
| sell | `assetIn: u32, assetOut: u32, amount: u128, maxLimit: u128, discount: bool` |
| buy | `assetOut: u32, assetIn: u32, amount: u128, maxLimit: u128, discount: bool` |
| add_liquidity_with_limits | `assetA: u32, assetB: u32, amountA: u128, amountBMaxLimit: u128, minShares: u128` |
| remove_liquidity_with_limits | `assetA: u32, assetB: u32, shareAmount: u128, minAmountA: u128, minAmountB: u128` |

**Events (6)**
| Name | Fields |
|------|--------|
| LiquidityAdded | `who: AccountId32, assetA: u32, assetB: u32, amountA: u128, amountB: u128` |
| LiquidityRemoved | `who: AccountId32, assetA: u32, assetB: u32, shares: u128` |
| PoolCreated | `who: AccountId32, assetA: u32, assetB: u32, initialSharesAmount: u128, shareToken: u32, pool: AccountId32` |
| PoolDestroyed | `who: AccountId32, assetA: u32, assetB: u32, shareToken: u32, pool: AccountId32` |
| SellExecuted | `who: AccountId32, assetIn: u32, assetOut: u32, amount: u128, salePrice: u128, feeAsset: u32, feeAmount: u128, pool: AccountId32` |
| BuyExecuted | `who: AccountId32, assetOut: u32, assetIn: u32, amount: u128, buyPrice: u128, feeAsset: u32, feeAmount: u128, pool: AccountId32` |

**Constants (7)**
| Name | Type |
|------|------|
| NativeAssetId | `u32` |
| GetExchangeFee | `(u32,u32)` |
| MinTradingLimit | `u128` |
| MinPoolLiquidity | `u128` |
| MaxInRatio | `u128` |
| MaxOutRatio | `u128` |
| OracleSource | `[u8;8]` |

#### Referrals (index: 75)

**Storage (10)**
| Name | Type |
|------|------|
| ReferralCodes | `Map<Bytes -> AccountId32> [Blake2_128Concat]` |
| ReferralAccounts | `Map<AccountId32 -> Bytes> [Blake2_128Concat]` |
| LinkedAccounts | `Map<AccountId32 -> AccountId32> [Blake2_128Concat]` |
| ReferrerShares | `Map<AccountId32 -> u128> [Blake2_128Concat]` |
| TraderShares | `Map<AccountId32 -> u128> [Blake2_128Concat]` |
| TotalShares | `Value<u128>` |
| Referrer | `Map<AccountId32 -> (PalletReferralsLevel,u128)> [Blake2_128Concat]` |
| AssetRewards | `Map<(u32,PalletReferralsLevel) -> {"referrer":"Permill","trader":"Permill","external":"Permill"}> [Blake2_128Concat, Blake2_128Concat]` |
| PendingConversions | `Map<u32 -> Null> [Blake2_128Concat]` |
| CounterForPendingConversions | `Value<u32>` |

**Calls (5)**
| Name | Args |
|------|------|
| register_code | `code: Bytes` |
| link_code | `code: Bytes` |
| convert | `assetId: u32` |
| claim_rewards | `none` |
| set_reward_percentage | `assetId: u32, level: Lookup249, rewards: Lookup250` |

**Events (6)**
| Name | Fields |
|------|--------|
| CodeRegistered | `code: Bytes, account: AccountId32` |
| CodeLinked | `account: AccountId32, code: Bytes, referralAccount: AccountId32` |
| Converted | `from: Lookup500, to: Lookup500` |
| Claimed | `who: AccountId32, referrerRewards: u128, tradeRewards: u128` |
| AssetRewardsUpdated | `assetId: u32, level: Lookup249, rewards: Lookup250` |
| LevelUp | `who: AccountId32, level: Lookup249` |

**Constants (6)**
| Name | Type |
|------|------|
| RewardAsset | `u32` |
| PalletId | `[u8;8]` |
| RegistrationFee | `(u32,u128,AccountId32)` |
| CodeLength | `u32` |
| MinCodeLength | `u32` |
| SeedNativeAmount | `u128` |

#### XYKLiquidityMining (index: 95)

**Calls (15)**
| Name | Args |
|------|------|
| create_global_farm | `totalRewards: u128, plannedYieldingPeriods: u32, blocksPerPeriod: u32, incentivizedAsset: u32, rewardCurrency: u32, owner: AccountId32, yieldPerPeriod: Perquintill, minDeposit: u128, priceAdjustment: u128` |
| update_global_farm | `globalFarmId: u32, priceAdjustment: u128` |
| terminate_global_farm | `globalFarmId: u32` |
| create_yield_farm | `globalFarmId: u32, assetPair: Lookup281, multiplier: u128, loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>` |
| update_yield_farm | `globalFarmId: u32, assetPair: Lookup281, multiplier: u128` |
| stop_yield_farm | `globalFarmId: u32, assetPair: Lookup281` |
| resume_yield_farm | `globalFarmId: u32, yieldFarmId: u32, assetPair: Lookup281, multiplier: u128` |
| terminate_yield_farm | `globalFarmId: u32, yieldFarmId: u32, assetPair: Lookup281` |
| deposit_shares | `globalFarmId: u32, yieldFarmId: u32, assetPair: Lookup281, sharesAmount: u128` |
| redeposit_shares | `globalFarmId: u32, yieldFarmId: u32, assetPair: Lookup281, depositId: u128` |
| claim_rewards | `depositId: u128, yieldFarmId: u32` |
| withdraw_shares | `depositId: u128, yieldFarmId: u32, assetPair: Lookup281` |
| join_farms | `farmEntries: Vec<(u32,u32)>, assetPair: Lookup281, sharesAmount: u128` |
| add_liquidity_and_join_farms | `assetA: u32, assetB: u32, amountA: u128, amountBMaxLimit: u128, farmEntries: Vec<(u32,u32)>` |
| exit_farms | `depositId: u128, assetPair: Lookup281, farmEntries: Vec<u32>` |

**Events (13)**
| Name | Fields |
|------|--------|
| GlobalFarmCreated | `id: u32, owner: AccountId32, totalRewards: u128, rewardCurrency: u32, yieldPerPeriod: Perquintill, plannedYieldingPeriods: u32, blocksPerPeriod: u32, incentivizedAsset: u32, maxRewardPerPeriod: u128, minDeposit: u128, priceAdjustment: u128` |
| GlobalFarmUpdated | `id: u32, priceAdjustment: u128` |
| YieldFarmCreated | `globalFarmId: u32, yieldFarmId: u32, multiplier: u128, assetPair: Lookup281, loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>` |
| GlobalFarmTerminated | `globalFarmId: u32, who: AccountId32, rewardCurrency: u32, undistributedRewards: u128` |
| SharesDeposited | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, amount: u128, lpToken: u32, depositId: u128` |
| SharesRedeposited | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, amount: u128, lpToken: u32, depositId: u128` |
| RewardClaimed | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, claimed: u128, rewardCurrency: u32, depositId: u128` |
| SharesWithdrawn | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, lpToken: u32, amount: u128, depositId: u128` |
| YieldFarmStopped | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, assetPair: Lookup281` |
| YieldFarmResumed | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, assetPair: Lookup281, multiplier: u128` |
| YieldFarmTerminated | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, assetPair: Lookup281` |
| YieldFarmUpdated | `globalFarmId: u32, yieldFarmId: u32, who: AccountId32, assetPair: Lookup281, multiplier: u128` |
| DepositDestroyed | `who: AccountId32, depositId: u128` |

**Constants (3)**
| Name | Type |
|------|------|
| NFTCollectionId | `u128` |
| OracleSource | `[u8;8]` |
| OraclePeriod | `{"_enum":["LastBlock","Short","TenMinutes","Hour","Day","Week"]}` |

#### XYKWarehouseLM (index: 96)

**Storage (6)**
| Name | Type |
|------|------|
| FarmSequencer | `Value<u32>` |
| DepositSequencer | `Value<u128>` |
| GlobalFarm | `Map<u32 -> {"id":"u32","owner":"AccountId32","updatedAt":"u32","totalSharesZ":"u128","accumulatedRpz":"u128","rewardCurrency":"u32","pendingRewards":"u128","accumulatedPaidRewards":"u128","yieldPerPeriod":"Perquintill","plannedYieldingPeriods":"u32","blocksPerPeriod":"u32","incentivizedAsset":"u32","maxRewardPerPeriod":"u128","minDeposit":"u128","liveYieldFarmsCount":"u32","totalYieldFarmsCount":"u32","priceAdjustment":"u128","state":"PalletLiquidityMiningFarmState"}> [Blake2_128Concat]` |
| YieldFarm | `Map<(AccountId32,u32,u32) -> {"id":"u32","updatedAt":"u32","totalShares":"u128","totalValuedShares":"u128","accumulatedRpvs":"u128","accumulatedRpz":"u128","loyaltyCurve":"Option<PalletLiquidityMiningLoyaltyCurve>","multiplier":"u128","state":"PalletLiquidityMiningFarmState","entriesCount":"u64","leftToDistribute":"u128","totalStopped":"u32"}> [Blake2_128Concat, Blake2_128Concat, Blake2_128Concat]` |
| Deposit | `Map<u128 -> {"shares":"u128","ammPoolId":"AccountId32","yieldFarmEntries":"Vec<PalletLiquidityMiningYieldFarmEntry>"}> [Twox64Concat]` |
| ActiveYieldFarm | `Map<(AccountId32,u32) -> u32> [Blake2_128Concat, Blake2_128Concat]` |

**Events (3)**
| Name | Fields |
|------|--------|
| GlobalFarmAccRPZUpdated | `globalFarmId: u32, accumulatedRpz: u128, totalSharesZ: u128` |
| YieldFarmAccRPVSUpdated | `globalFarmId: u32, yieldFarmId: u32, accumulatedRpvs: u128, totalValuedShares: u128` |
| AllRewardsDistributed | `globalFarmId: u32` |

**Constants (6)**
| Name | Type |
|------|------|
| PalletId | `[u8;8]` |
| TreasuryAccountId | `AccountId32` |
| MinTotalFarmRewards | `u128` |
| MinPlannedYieldingPeriods | `u32` |
| MaxFarmEntriesPerDeposit | `u32` |
| MaxYieldFarmsPerGlobalFarm | `u32` |

#### DCA (index: 66)

**Storage (7)**
| Name | Type |
|------|------|
| ScheduleIdSequencer | `Value<u32>` |
| Schedules | `Map<u32 -> {"owner":"AccountId32","period":"u32","totalAmount":"u128","maxRetries":"Option<u8>","stabilityThreshold":"Option<Permill>","slippage":"Option<Permill>","order":"PalletDcaOrder"}> [Blake2_128Concat]` |
| ScheduleOwnership | `Map<(AccountId32,u32) -> Null> [Blake2_128Concat, Twox64Concat]` |
| RemainingAmounts | `Map<u32 -> u128> [Blake2_128Concat]` |
| RetriesOnError | `Map<u32 -> u8> [Blake2_128Concat]` |
| ScheduleExecutionBlock | `Map<u32 -> u32> [Blake2_128Concat]` |
| ScheduleIdsPerBlock | `Map<u32 -> Vec<u32>> [Blake2_128Concat]` |

**Calls (3)**
| Name | Args |
|------|------|
| schedule | `schedule: Lookup287, startExecutionBlock: Option<u32>` |
| terminate | `scheduleId: u32, nextExecutionBlock: Option<u32>` |
| unlock_reserves | `who: AccountId32, assetId: u32` |

**Events (9)**
| Name | Fields |
|------|--------|
| ExecutionStarted | `id: u32, block: u32` |
| Scheduled | `id: u32, who: AccountId32, period: u32, totalAmount: u128, order: Lookup288` |
| ExecutionPlanned | `id: u32, who: AccountId32, block: u32` |
| TradeExecuted | `id: u32, who: AccountId32, amountIn: u128, amountOut: u128` |
| TradeFailed | `id: u32, who: AccountId32, error: Lookup26` |
| Terminated | `id: u32, who: AccountId32, error: Lookup26` |
| Completed | `id: u32, who: AccountId32` |
| RandomnessGenerationFailed | `block: u32, error: Lookup26` |
| ReserveUnlocked | `who: AccountId32, assetId: u32` |

**Constants (12)**
| Name | Type |
|------|------|
| MaxPriceDifferenceBetweenBlocks | `Permill` |
| MaxConfigurablePriceDifferenceBetweenBlocks | `Permill` |
| MaxSchedulePerBlock | `u32` |
| MaxNumberOfRetriesOnError | `u8` |
| MinimalPeriod | `u32` |
| BumpChance | `Percent` |
| MinimumTradingLimit | `u128` |
| NativeAssetId | `u32` |
| PolkadotNativeAssetId | `u32` |
| MinBudgetInNativeCurrency | `u128` |
| FeeReceiver | `AccountId32` |
| NamedReserveId | `[u8;8]` |

#### Broadcast (index: 204)

**Storage (3)**
| Name | Type |
|------|------|
| IncrementalId | `Value<u32>` |
| ExecutionContext | `Value<Vec<PalletBroadcastExecutionType>>` |
| Swapper | `Value<AccountId32>` |

**Events (1)**
| Name | Fields |
|------|--------|
| Swapped3 | `swapper: AccountId32, filler: AccountId32, fillerType: Lookup553, operation: Lookup554, inputs: Vec<PalletBroadcastAsset>, outputs: Vec<PalletBroadcastAsset>, fees: Vec<PalletBroadcastFee>, operationStack: Vec<PalletBroadcastExecutionType>` |

### System Pallets (6)

<details>
<summary>Click to expand</summary>

#### System (index: 1)

**Storage (18)**
| Name | Type |
|------|------|
| Account | `Map<AccountId32 -> {"nonce":"u32","consumers":"u32","providers":"u32","sufficients":"u32","data":"PalletBalancesAccountData"}> [Blake2_128Concat]` |
| ExtrinsicCount | `Value<u32>` |
| InherentsApplied | `Value<bool>` |
| BlockWeight | `Value<{"normal":"SpWeightsWeightV2Weight","operational":"SpWeightsWeightV2Weight","mandatory":"SpWeightsWeightV2Weight"}>` |
| AllExtrinsicsLen | `Value<u32>` |
| BlockHash | `Map<u32 -> H256> [Twox64Concat]` |
| ExtrinsicData | `Map<u32 -> Bytes> [Twox64Concat]` |
| Number | `Value<u32>` |
| ParentHash | `Value<H256>` |
| Digest | `Value<{"logs":"Vec<SpRuntimeDigestDigestItem>"}>` |
| Events | `Value<Vec<FrameSystemEventRecord>>` |
| EventCount | `Value<u32>` |
| EventTopics | `Map<H256 -> Vec<(u32,u32)>> [Blake2_128Concat]` |
| LastRuntimeUpgrade | `Value<{"specVersion":"Compact<u32>","specName":"Text"}>` |
| UpgradedToU32RefCount | `Value<bool>` |
| UpgradedToTripleRefCount | `Value<bool>` |
| ExecutionPhase | `Value<{"_enum":{"ApplyExtrinsic":"u32","Finalization":"Null","Initialization":"Null"}}>` |
| AuthorizedUpgrade | `Value<{"codeHash":"H256","checkVersion":"bool"}>` |

**Calls (12)**
| Name | Args |
|------|------|
| remark | `remark: Bytes` |
| set_heap_pages | `pages: u64` |
| set_code | `code: Bytes` |
| set_code_without_checks | `code: Bytes` |
| set_storage | `items: Vec<(Bytes,Bytes)>` |
| kill_storage | `keys_: Vec<Bytes>` |
| kill_prefix | `prefix: Bytes, subkeys: u32` |
| remark_with_event | `remark: Bytes` |
| __Unused8 | `none` |
| authorize_upgrade | `codeHash: H256` |
| authorize_upgrade_without_checks | `codeHash: H256` |
| apply_authorized_upgrade | `code: Bytes` |

**Events (7)**
| Name | Fields |
|------|--------|
| ExtrinsicSuccess | `dispatchInfo: Lookup23` |
| ExtrinsicFailed | `dispatchError: Lookup26, dispatchInfo: Lookup23` |
| CodeUpdated | `none` |
| NewAccount | `account: AccountId32` |
| KilledAccount | `account: AccountId32` |
| Remarked | `sender: AccountId32, hash_: H256` |
| UpgradeAuthorized | `codeHash: H256, checkVersion: bool` |

**Constants (6)**
| Name | Type |
|------|------|
| BlockWeights | `{"baseBlock":"SpWeightsWeightV2Weight","maxBlock":"SpWeightsWeightV2Weight","perClass":"FrameSupportDispatchPerDispatchClassWeightsPerClass"}` |
| BlockLength | `{"max":"FrameSupportDispatchPerDispatchClassU32"}` |
| BlockHashCount | `u32` |
| DbWeight | `{"read":"u64","write":"u64"}` |
| Version | `{"specName":"Text","implName":"Text","authoringVersion":"u32","specVersion":"u32","implVersion":"u32","apis":"Vec<([u8;8],u32)>","transactionVersion":"u32","stateVersion":"u8"}` |
| SS58Prefix | `u16` |

#### Timestamp (index: 3)

**Storage (2)**
| Name | Type |
|------|------|
| Now | `Value<u64>` |
| DidUpdate | `Value<bool>` |

**Calls (1)**
| Name | Args |
|------|------|
| set | `now: Compact<u64>` |

**Constants (1)**
| Name | Type |
|------|------|
| MinimumPeriod | `u64` |

#### Balances (index: 7)

**Storage (7)**
| Name | Type |
|------|------|
| TotalIssuance | `Value<u128>` |
| InactiveIssuance | `Value<u128>` |
| Account | `Map<AccountId32 -> {"free":"u128","reserved":"u128","frozen":"u128","flags":"u128"}> [Blake2_128Concat]` |
| Locks | `Map<AccountId32 -> Vec<PalletBalancesBalanceLock>> [Blake2_128Concat]` |
| Reserves | `Map<AccountId32 -> Vec<PalletBalancesReserveData>> [Blake2_128Concat]` |
| Holds | `Map<AccountId32 -> Vec<{"id":"HydradxRuntimeRuntimeHoldReason","amount":"u128"}>> [Blake2_128Concat]` |
| Freezes | `Map<AccountId32 -> Vec<FrameSupportTokensMiscIdAmount>> [Blake2_128Concat]` |

**Calls (11)**
| Name | Args |
|------|------|
| transfer_allow_death | `dest: AccountId32, value: Compact<u128>` |
| __Unused1 | `none` |
| force_transfer | `source: AccountId32, dest: AccountId32, value: Compact<u128>` |
| transfer_keep_alive | `dest: AccountId32, value: Compact<u128>` |
| transfer_all | `dest: AccountId32, keepAlive: bool` |
| force_unreserve | `who: AccountId32, amount: u128` |
| upgrade_accounts | `who: Vec<AccountId32>` |
| __Unused7 | `none` |
| force_set_balance | `who: AccountId32, newFree: Compact<u128>` |
| force_adjust_total_issuance | `direction: Lookup77, delta: Compact<u128>` |
| burn | `value: Compact<u128>, keepAlive: bool` |

**Events (22)**
| Name | Fields |
|------|--------|
| Endowed | `account: AccountId32, freeBalance: u128` |
| DustLost | `account: AccountId32, amount: u128` |
| Transfer | `from: AccountId32, to: AccountId32, amount: u128` |
| BalanceSet | `who: AccountId32, free: u128` |
| Reserved | `who: AccountId32, amount: u128` |
| Unreserved | `who: AccountId32, amount: u128` |
| ReserveRepatriated | `from: AccountId32, to: AccountId32, amount: u128, destinationStatus: Lookup32` |
| Deposit | `who: AccountId32, amount: u128` |
| Withdraw | `who: AccountId32, amount: u128` |
| Slashed | `who: AccountId32, amount: u128` |
| Minted | `who: AccountId32, amount: u128` |
| Burned | `who: AccountId32, amount: u128` |
| Suspended | `who: AccountId32, amount: u128` |
| Restored | `who: AccountId32, amount: u128` |
| Upgraded | `who: AccountId32` |
| Issued | `amount: u128` |
| Rescinded | `amount: u128` |
| Locked | `who: AccountId32, amount: u128` |
| Unlocked | `who: AccountId32, amount: u128` |
| Frozen | `who: AccountId32, amount: u128` |
| Thawed | `who: AccountId32, amount: u128` |
| TotalIssuanceForced | `old: u128, new_: u128` |

**Constants (4)**
| Name | Type |
|------|------|
| ExistentialDeposit | `u128` |
| MaxLocks | `u32` |
| MaxReserves | `u32` |
| MaxFreezes | `u32` |

#### Treasury (index: 11)

**Storage (6)**
| Name | Type |
|------|------|
| ProposalCount | `Value<u32>` |
| Proposals | `Map<u32 -> {"proposer":"AccountId32","value":"u128","beneficiary":"AccountId32","bond":"u128"}> [Twox64Concat]` |
| Deactivated | `Value<u128>` |
| Approvals | `Value<Vec<u32>>` |
| SpendCount | `Value<u32>` |
| Spends | `Map<u32 -> {"assetKind":"Null","amount":"u128","beneficiary":"AccountId32","validFrom":"u32","expireAt":"u32","status":"PalletTreasuryPaymentState"}> [Twox64Concat]` |

**Calls (9)**
| Name | Args |
|------|------|
| __Unused0 | `none` |
| __Unused1 | `none` |
| __Unused2 | `none` |
| spend_local | `amount: Compact<u128>, beneficiary: AccountId32` |
| remove_approval | `proposalId: Compact<u32>` |
| spend | `assetKind: Null, amount: Compact<u128>, beneficiary: AccountId32, validFrom: Option<u32>` |
| payout | `index: u32` |
| check_status | `index: u32` |
| void_spend | `index: u32` |

**Events (12)**
| Name | Fields |
|------|--------|
| Spending | `budgetRemaining: u128` |
| Awarded | `proposalIndex: u32, award: u128, account: AccountId32` |
| Burnt | `burntFunds: u128` |
| Rollover | `rolloverBalance: u128` |
| Deposit | `value: u128` |
| SpendApproved | `proposalIndex: u32, amount: u128, beneficiary: AccountId32` |
| UpdatedInactive | `reactivated: u128, deactivated: u128` |
| AssetSpendApproved | `index: u32, assetKind: Null, amount: u128, beneficiary: AccountId32, validFrom: u32, expireAt: u32` |
| AssetSpendVoided | `index: u32` |
| Paid | `index: u32, paymentId: Null` |
| PaymentFailed | `index: u32, paymentId: Null` |
| SpendProcessed | `index: u32` |

**Constants (5)**
| Name | Type |
|------|------|
| SpendPeriod | `u32` |
| Burn | `Permill` |
| PalletId | `[u8;8]` |
| MaxApprovals | `u32` |
| PayoutPeriod | `u32` |

#### Democracy (index: 19)

**Storage (12)**
| Name | Type |
|------|------|
| PublicPropCount | `Value<u32>` |
| PublicProps | `Value<Vec<(u32,FrameSupportPreimagesBounded,AccountId32)>>` |
| DepositOf | `Map<u32 -> (Vec<AccountId32>,u128)> [Twox64Concat]` |
| ReferendumCount | `Value<u32>` |
| LowestUnbaked | `Value<u32>` |
| ReferendumInfoOf | `Map<u32 -> {"_enum":{"Ongoing":"PalletDemocracyReferendumStatus","Finished":"{\"approved\":\"bool\",\"end\":\"u32\"}"}}> [Twox64Concat]` |
| VotingOf | `Map<AccountId32 -> {"_enum":{"Direct":"{\"votes\":\"Vec<(u32,PalletDemocracyVoteAccountVote)>\",\"delegations\":\"PalletDemocracyDelegations\",\"prior\":\"PalletDemocracyVotePriorLock\"}","Delegating":"{\"balance\":\"u128\",\"target\":\"AccountId32\",\"conviction\":\"PalletDemocracyConviction\",\"delegations\":\"PalletDemocracyDelegations\",\"prior\":\"PalletDemocracyVotePriorLock\"}"}}> [Twox64Concat]` |
| LastTabledWasExternal | `Value<bool>` |
| NextExternal | `Value<(FrameSupportPreimagesBounded,PalletDemocracyVoteThreshold)>` |
| Blacklist | `Map<H256 -> (u32,Vec<AccountId32>)> [Identity]` |
| Cancellations | `Map<H256 -> bool> [Identity]` |
| MetadataOf | `Map<{"_enum":{"External":"Null","Proposal":"u32","Referendum":"u32"}} -> H256> [Blake2_128Concat]` |

**Calls (20)**
| Name | Args |
|------|------|
| propose | `proposal: Lookup67, value: Compact<u128>` |
| second | `proposal: Compact<u32>` |
| vote | `refIndex: Compact<u32>, vote: Lookup44` |
| emergency_cancel | `refIndex: u32` |
| external_propose | `proposal: Lookup67` |
| external_propose_majority | `proposal: Lookup67` |
| external_propose_default | `proposal: Lookup67` |
| fast_track | `proposalHash: H256, votingPeriod: u32, delay: u32` |
| veto_external | `proposalHash: H256` |
| cancel_referendum | `refIndex: Compact<u32>` |
| delegate | `to: AccountId32, conviction: Lookup160, balance: u128` |
| undelegate | `none` |
| clear_public_proposals | `none` |
| unlock | `target: AccountId32` |
| remove_vote | `index: u32` |
| remove_other_vote | `target: AccountId32, index: u32` |
| blacklist | `proposalHash: H256, maybeRefIndex: Option<u32>` |
| cancel_proposal | `propIndex: Compact<u32>` |
| set_metadata | `owner: Lookup46, maybeHash: Option<H256>` |
| force_remove_vote | `target: AccountId32, index: u32` |

**Events (17)**
| Name | Fields |
|------|--------|
| Proposed | `proposalIndex: u32, deposit: u128` |
| Tabled | `proposalIndex: u32, deposit: u128` |
| ExternalTabled | `none` |
| Started | `refIndex: u32, threshold: Lookup43` |
| Passed | `refIndex: u32` |
| NotPassed | `refIndex: u32` |
| Cancelled | `refIndex: u32` |
| Delegated | `who: AccountId32, target: AccountId32` |
| Undelegated | `account: AccountId32` |
| Vetoed | `who: AccountId32, proposalHash: H256, until: u32` |
| Blacklisted | `proposalHash: H256` |
| Voted | `voter: AccountId32, refIndex: u32, vote: Lookup44` |
| Seconded | `seconder: AccountId32, propIndex: u32` |
| ProposalCanceled | `propIndex: u32` |
| MetadataSet | `owner: Lookup46, hash_: H256` |
| MetadataCleared | `owner: Lookup46, hash_: H256` |
| MetadataTransferred | `prevOwner: Lookup46, owner: Lookup46, hash_: H256` |

**Constants (12)**
| Name | Type |
|------|------|
| EnactmentPeriod | `u32` |
| LaunchPeriod | `u32` |
| VotingPeriod | `u32` |
| VoteLockingPeriod | `u32` |
| MinimumDeposit | `u128` |
| InstantAllowed | `bool` |
| FastTrackVotingPeriod | `u32` |
| CooloffPeriod | `u32` |
| MaxVotes | `u32` |
| MaxProposals | `u32` |
| MaxDeposits | `u32` |
| MaxBlacklisted | `u32` |

#### ParachainSystem (index: 103)

**Storage (24)**
| Name | Type |
|------|------|
| UnincludedSegment | `Value<Vec<CumulusPalletParachainSystemUnincludedSegmentAncestor>>` |
| AggregatedUnincludedSegment | `Value<{"usedBandwidth":"CumulusPalletParachainSystemUnincludedSegmentUsedBandwidth","hrmpWatermark":"Option<u32>","consumedGoAheadSignal":"Option<PolkadotPrimitivesV8UpgradeGoAhead>"}>` |
| PendingValidationCode | `Value<Bytes>` |
| NewValidationCode | `Value<Bytes>` |
| ValidationData | `Value<{"parentHead":"Bytes","relayParentNumber":"u32","relayParentStorageRoot":"H256","maxPovSize":"u32"}>` |
| DidSetValidationCode | `Value<bool>` |
| LastRelayChainBlockNumber | `Value<u32>` |
| UpgradeRestrictionSignal | `Value<Option<PolkadotPrimitivesV8UpgradeRestriction>>` |
| UpgradeGoAhead | `Value<Option<PolkadotPrimitivesV8UpgradeGoAhead>>` |
| RelayStateProof | `Value<{"trieNodes":"BTreeSet<Bytes>"}>` |
| RelevantMessagingState | `Value<{"dmqMqcHead":"H256","relayDispatchQueueRemainingCapacity":"CumulusPalletParachainSystemRelayStateSnapshotRelayDispatchQueueRemainingCapacity","ingressChannels":"Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>","egressChannels":"Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>"}>` |
| HostConfiguration | `Value<{"maxCodeSize":"u32","maxHeadDataSize":"u32","maxUpwardQueueCount":"u32","maxUpwardQueueSize":"u32","maxUpwardMessageSize":"u32","maxUpwardMessageNumPerCandidate":"u32","hrmpMaxMessageNumPerCandidate":"u32","validationUpgradeCooldown":"u32","validationUpgradeDelay":"u32","asyncBackingParams":"PolkadotPrimitivesV8AsyncBackingAsyncBackingParams"}>` |
| LastDmqMqcHead | `Value<H256>` |
| LastHrmpMqcHeads | `Value<BTreeMap<u32, H256>>` |
| ProcessedDownwardMessages | `Value<u32>` |
| HrmpWatermark | `Value<u32>` |
| HrmpOutboundMessages | `Value<Vec<PolkadotCorePrimitivesOutboundHrmpMessage>>` |
| UpwardMessages | `Value<Vec<Bytes>>` |
| PendingUpwardMessages | `Value<Vec<Bytes>>` |
| UpwardDeliveryFeeFactor | `Value<u128>` |
| AnnouncedHrmpMessagesPerCandidate | `Value<u32>` |
| ReservedXcmpWeightOverride | `Value<{"refTime":"Compact<u64>","proofSize":"Compact<u64>"}>` |
| ReservedDmpWeightOverride | `Value<{"refTime":"Compact<u64>","proofSize":"Compact<u64>"}>` |
| CustomValidationHeadData | `Value<Bytes>` |

**Calls (2)**
| Name | Args |
|------|------|
| set_validation_data | `data: Lookup291` |
| sudo_send_upward_message | `message: Bytes` |

**Events (6)**
| Name | Fields |
|------|--------|
| ValidationFunctionStored | `none` |
| ValidationFunctionApplied | `relayChainBlockNum: u32` |
| ValidationFunctionDiscarded | `none` |
| DownwardMessagesReceived | `count: u32` |
| DownwardMessagesProcessed | `weightUsed: Lookup10, dmqHead: H256` |
| UpwardMessageSent | `messageHash: Option<[u8;32]>` |

**Constants (1)**
| Name | Type |
|------|------|
| SelfParaId | `u32` |

</details>

### XCM Pallets (7)

<details>
<summary>Click to expand</summary>

#### ParachainSystem (index: 103)

**Storage (24)**
| Name | Type |
|------|------|
| UnincludedSegment | `Value<Vec<CumulusPalletParachainSystemUnincludedSegmentAncestor>>` |
| AggregatedUnincludedSegment | `Value<{"usedBandwidth":"CumulusPalletParachainSystemUnincludedSegmentUsedBandwidth","hrmpWatermark":"Option<u32>","consumedGoAheadSignal":"Option<PolkadotPrimitivesV8UpgradeGoAhead>"}>` |
| PendingValidationCode | `Value<Bytes>` |
| NewValidationCode | `Value<Bytes>` |
| ValidationData | `Value<{"parentHead":"Bytes","relayParentNumber":"u32","relayParentStorageRoot":"H256","maxPovSize":"u32"}>` |
| DidSetValidationCode | `Value<bool>` |
| LastRelayChainBlockNumber | `Value<u32>` |
| UpgradeRestrictionSignal | `Value<Option<PolkadotPrimitivesV8UpgradeRestriction>>` |
| UpgradeGoAhead | `Value<Option<PolkadotPrimitivesV8UpgradeGoAhead>>` |
| RelayStateProof | `Value<{"trieNodes":"BTreeSet<Bytes>"}>` |
| RelevantMessagingState | `Value<{"dmqMqcHead":"H256","relayDispatchQueueRemainingCapacity":"CumulusPalletParachainSystemRelayStateSnapshotRelayDispatchQueueRemainingCapacity","ingressChannels":"Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>","egressChannels":"Vec<(u32,PolkadotPrimitivesV8AbridgedHrmpChannel)>"}>` |
| HostConfiguration | `Value<{"maxCodeSize":"u32","maxHeadDataSize":"u32","maxUpwardQueueCount":"u32","maxUpwardQueueSize":"u32","maxUpwardMessageSize":"u32","maxUpwardMessageNumPerCandidate":"u32","hrmpMaxMessageNumPerCandidate":"u32","validationUpgradeCooldown":"u32","validationUpgradeDelay":"u32","asyncBackingParams":"PolkadotPrimitivesV8AsyncBackingAsyncBackingParams"}>` |
| LastDmqMqcHead | `Value<H256>` |
| LastHrmpMqcHeads | `Value<BTreeMap<u32, H256>>` |
| ProcessedDownwardMessages | `Value<u32>` |
| HrmpWatermark | `Value<u32>` |
| HrmpOutboundMessages | `Value<Vec<PolkadotCorePrimitivesOutboundHrmpMessage>>` |
| UpwardMessages | `Value<Vec<Bytes>>` |
| PendingUpwardMessages | `Value<Vec<Bytes>>` |
| UpwardDeliveryFeeFactor | `Value<u128>` |
| AnnouncedHrmpMessagesPerCandidate | `Value<u32>` |
| ReservedXcmpWeightOverride | `Value<{"refTime":"Compact<u64>","proofSize":"Compact<u64>"}>` |
| ReservedDmpWeightOverride | `Value<{"refTime":"Compact<u64>","proofSize":"Compact<u64>"}>` |
| CustomValidationHeadData | `Value<Bytes>` |

**Calls (2)**
| Name | Args |
|------|------|
| set_validation_data | `data: Lookup291` |
| sudo_send_upward_message | `message: Bytes` |

**Events (6)**
| Name | Fields |
|------|--------|
| ValidationFunctionStored | `none` |
| ValidationFunctionApplied | `relayChainBlockNum: u32` |
| ValidationFunctionDiscarded | `none` |
| DownwardMessagesReceived | `count: u32` |
| DownwardMessagesProcessed | `weightUsed: Lookup10, dmqHead: H256` |
| UpwardMessageSent | `messageHash: Option<[u8;32]>` |

**Constants (1)**
| Name | Type |
|------|------|
| SelfParaId | `u32` |

#### ParachainInfo (index: 105)

**Storage (1)**
| Name | Type |
|------|------|
| ParachainId | `Value<u32>` |

#### PolkadotXcm (index: 107)

**Storage (14)**
| Name | Type |
|------|------|
| QueryCounter | `Value<u64>` |
| Queries | `Map<u64 -> {"_enum":{"Pending":"{\"responder\":\"XcmVersionedLocation\",\"maybeMatchQuerier\":\"Option<XcmVersionedLocation>\",\"maybeNotify\":\"Option<(u8,u8)>\",\"timeout\":\"u32\"}","VersionNotifier":"{\"origin\":\"XcmVersionedLocation\",\"isActive\":\"bool\"}","Ready":"{\"response\":\"XcmVersionedResponse\",\"at\":\"u32\"}"}}> [Blake2_128Concat]` |
| AssetTraps | `Map<H256 -> u32> [Identity]` |
| SafeXcmVersion | `Value<u32>` |
| SupportedVersion | `Map<(u32,XcmVersionedLocation) -> u32> [Twox64Concat, Blake2_128Concat]` |
| VersionNotifiers | `Map<(u32,XcmVersionedLocation) -> u64> [Twox64Concat, Blake2_128Concat]` |
| VersionNotifyTargets | `Map<(u32,XcmVersionedLocation) -> (u64,SpWeightsWeightV2Weight,u32)> [Twox64Concat, Blake2_128Concat]` |
| VersionDiscoveryQueue | `Value<Vec<(XcmVersionedLocation,u32)>>` |
| CurrentMigration | `Value<{"_enum":{"MigrateSupportedVersion":"Null","MigrateVersionNotifiers":"Null","NotifyCurrentTargets":"Option<Bytes>","MigrateAndNotifyOldTargets":"Null"}}>` |
| RemoteLockedFungibles | `Map<(u32,AccountId32,XcmVersionedAssetId) -> {"amount":"u128","owner":"XcmVersionedLocation","locker":"XcmVersionedLocation","consumers":"Vec<(Null,u128)>"}> [Twox64Concat, Blake2_128Concat, Blake2_128Concat]` |
| LockedFungibles | `Map<AccountId32 -> Vec<(u128,XcmVersionedLocation)>> [Blake2_128Concat]` |
| XcmExecutionSuspended | `Value<bool>` |
| ShouldRecordXcm | `Value<bool>` |
| RecordedXcm | `Value<Vec<StagingXcmV4Instruction>>` |

**Calls (14)**
| Name | Args |
|------|------|
| send | `dest: Lookup305, message: Lookup313` |
| teleport_assets | `dest: Lookup305, beneficiary: Lookup305, assets: Lookup378, feeAssetItem: u32` |
| reserve_transfer_assets | `dest: Lookup305, beneficiary: Lookup305, assets: Lookup378, feeAssetItem: u32` |
| execute | `message: Lookup379, maxWeight: Lookup10` |
| force_xcm_version | `location: Lookup95, version: u32` |
| force_default_xcm_version | `maybeXcmVersion: Option<u32>` |
| force_subscribe_version_notify | `location: Lookup305` |
| force_unsubscribe_version_notify | `location: Lookup305` |
| limited_reserve_transfer_assets | `dest: Lookup305, beneficiary: Lookup305, assets: Lookup378, feeAssetItem: u32, weightLimit: Lookup358` |
| limited_teleport_assets | `dest: Lookup305, beneficiary: Lookup305, assets: Lookup378, feeAssetItem: u32, weightLimit: Lookup358` |
| force_suspension | `suspended: bool` |
| transfer_assets | `dest: Lookup305, beneficiary: Lookup305, assets: Lookup378, feeAssetItem: u32, weightLimit: Lookup358` |
| claim_assets | `assets: Lookup378, beneficiary: Lookup305` |
| transfer_assets_using_type_and_then | `dest: Lookup305, assets: Lookup378, assetsTransferType: Lookup390, remoteFeesId: Lookup391, feesTransferType: Lookup390, customXcmOnDest: Lookup313, weightLimit: Lookup358` |

**Events (24)**
| Name | Fields |
|------|--------|
| Attempted | `outcome: Lookup526` |
| Sent | `origin: Lookup95, destination: Lookup95, message: Vec<StagingXcmV4Instruction>, messageId: [u8;32]` |
| UnexpectedResponse | `origin: Lookup95, queryId: u64` |
| ResponseReady | `queryId: u64, response: Lookup368` |
| Notified | `queryId: u64, palletIndex: u8, callIndex: u8` |
| NotifyOverweight | `queryId: u64, palletIndex: u8, callIndex: u8, actualWeight: Lookup10, maxBudgetedWeight: Lookup10` |
| NotifyDispatchError | `queryId: u64, palletIndex: u8, callIndex: u8` |
| NotifyDecodeFailed | `queryId: u64, palletIndex: u8, callIndex: u8` |
| InvalidResponder | `origin: Lookup95, queryId: u64, expectedLocation: Option<StagingXcmV4Location>` |
| InvalidResponderVersion | `origin: Lookup95, queryId: u64` |
| ResponseTaken | `queryId: u64` |
| AssetsTrapped | `hash_: H256, origin: Lookup95, assets: Lookup378` |
| VersionChangeNotified | `destination: Lookup95, result: u32, cost: Vec<StagingXcmV4Asset>, messageId: [u8;32]` |
| SupportedVersionChanged | `location: Lookup95, version: u32` |
| NotifyTargetSendFail | `location: Lookup95, queryId: u64, error: Lookup345` |
| NotifyTargetMigrationFail | `location: Lookup305, queryId: u64` |
| InvalidQuerierVersion | `origin: Lookup95, queryId: u64` |
| InvalidQuerier | `origin: Lookup95, queryId: u64, expectedQuerier: Lookup95, maybeActualQuerier: Option<StagingXcmV4Location>` |
| VersionNotifyStarted | `destination: Lookup95, cost: Vec<StagingXcmV4Asset>, messageId: [u8;32]` |
| VersionNotifyRequested | `destination: Lookup95, cost: Vec<StagingXcmV4Asset>, messageId: [u8;32]` |
| VersionNotifyUnrequested | `destination: Lookup95, cost: Vec<StagingXcmV4Asset>, messageId: [u8;32]` |
| FeesPaid | `paying: Lookup95, fees: Vec<StagingXcmV4Asset>` |
| AssetsClaimed | `hash_: H256, origin: Lookup95, assets: Lookup378` |
| VersionMigrationFinished | `version: u32` |

#### CumulusXcm (index: 109)

**Events (3)**
| Name | Fields |
|------|--------|
| InvalidFormat | `none` |
| UnsupportedVersion | `none` |
| ExecutedDownward | `field: [u8;32], field: Lookup526` |

#### XcmpQueue (index: 111)

**Storage (7)**
| Name | Type |
|------|------|
| InboundXcmpSuspended | `Value<BTreeSet<u32>>` |
| OutboundXcmpStatus | `Value<Vec<CumulusPalletXcmpQueueOutboundChannelDetails>>` |
| OutboundXcmpMessages | `Map<(u32,u16) -> Bytes> [Blake2_128Concat, Twox64Concat]` |
| SignalMessages | `Map<u32 -> Bytes> [Blake2_128Concat]` |
| QueueConfig | `Value<{"suspendThreshold":"u32","dropThreshold":"u32","resumeThreshold":"u32"}>` |
| QueueSuspended | `Value<bool>` |
| DeliveryFeeFactor | `Map<u32 -> u128> [Twox64Concat]` |

**Events (1)**
| Name | Fields |
|------|--------|
| XcmpMessageSent | `messageHash: [u8;32]` |

**Constants (3)**
| Name | Type |
|------|------|
| MaxInboundSuspended | `u32` |
| MaxActiveOutboundChannels | `u32` |
| MaxPageSize | `u32` |

#### OrmlXcm (index: 135)

**Calls (1)**
| Name | Args |
|------|------|
| send_as_sovereign | `dest: Lookup305, message: Lookup313` |

**Events (1)**
| Name | Fields |
|------|--------|
| Sent | `to: Lookup95, message: Vec<StagingXcmV4Instruction>` |

#### IsmpParachain (index: 181)

**Storage (3)**
| Name | Type |
|------|------|
| RelayChainStateCommitments | `Map<u32 -> H256> [Blake2_128Concat]` |
| ConsensusUpdated | `Value<bool>` |
| Parachains | `Map<u32 -> u64> [Identity]` |

**Calls (3)**
| Name | Args |
|------|------|
| update_parachain_consensus | `data: Lookup406` |
| add_parachain | `paraIds: Vec<IsmpParachainParachainData>` |
| remove_parachain | `paraIds: Vec<u32>` |

**Events (2)**
| Name | Fields |
|------|--------|
| ParachainsAdded | `paraIds: Vec<IsmpParachainParachainData>` |
| ParachainsRemoved | `paraIds: Vec<u32>` |

</details>

