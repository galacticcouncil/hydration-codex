# OMNISCIENCE: Hydration Stack Map

> Generated: 2025-12-27T18:35:54.945Z

## Commits
| Layer | Commit |
|-------|--------|
| Runtime | 4ca470c |
| SDK | f8d2c93 |
| Indexer | ae6ed3c |
| UI | eb7c539 |

## Coverage Summary

| Metric | Count | Coverage |
|--------|-------|----------|
| Runtime Extrinsics | 371 | - |
| SDK-Wrapped | 7 | 2% |
| Runtime Events | 410 | - |
| Indexed Events | 76 | 19% |
| UI-Exposed Features | 50 | - |


## Stack Flow

```
┌─────────────────────────────────────────────────────────────┐
│  L1: Runtime                                                │
│  371 extrinsics, 410 events                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────────────┐
│  L2: SDK        │ │  L3: Indexer│ │                         │
│  2% wrapped    │ │  19% indexed │ │                         │
└────────┬────────┘ └─────────────┘ │                         │
         │                          │                         │
         └──────────────────────────┤                         │
                                    ▼                         │
                           ┌─────────────────────────┐        │
                           │  L4: UI                 │        │
                           │  50 features exposed     │        │
                           └─────────────────────────┘        │
```


## Cross-Layer Connections (132)

| Pallet | Feature | Type | SDK | Indexer | UI |
|--------|---------|------|-----|---------|----|
| AssetRegistry | Registered | event | - | parseassetRegistryRegisteredData | - |
| AssetRegistry | Updated | event | - | parseassetRegistryUpdatedData | - |
| AssetRegistry | LocationSet | event | - | parseassetRegistryLocationSetData | - |
| Balances | Transfer | event | - | parsebalancesTransferData | - |
| Broadcast | Swapped3 | event | - | parsebroadcastSwapped3Data | - |
| ConvictionVoting | vote | extrinsic | - | - | Stake.unstake.ts |
| ConvictionVoting | remove_vote | extrinsic | - | - | Stake.unstake.ts |
| Currencies | transfer | extrinsic | - | - | TransferPositionModal.submit.ts |
| Currencies | Transferred | event | - | parsecurrenciesTransferredData | - |
| DCA | schedule | extrinsic | DCA.schedule | - | - |
| DCA | terminate | extrinsic | - | - | useTerminateDcaSchedule.ts |
| DCA | Scheduled | event | - | parsedcaScheduledData | - |
| DCA | ExecutionPlanned | event | - | parsedcaExecutionPlannedData | - |
| DCA | TradeExecuted | event | - | parsedcaTradeExecutedData | - |
| DCA | TradeFailed | event | - | parsedcaTradeFailedData | - |
| DCA | Terminated | event | - | parsedcaTerminatedData | - |
| DCA | Completed | event | - | parsedcaCompletedData | - |
| DCA | RandomnessGenerationFailed | event | - | parsedcaRandomnessGenerationFailedData | - |
| Democracy | vote | extrinsic | - | - | AssetDetailUnlock.tx.ts |
| Democracy | unlock | extrinsic | - | - | AssetDetailUnlock.tx.ts |
| Democracy | remove_vote | extrinsic | - | - | AssetDetailUnlock.tx.ts |
| Dispatcher | dispatch_with_extra_gas | extrinsic | Dispatcher.dispatch_with_extra_gas | - | PlaceOrderModalContent.submit.ts |
| Dispatcher | dispatch_evm_call | extrinsic | - | - | queries.ts |
| EVM | call | extrinsic | - | - | tx.ts |
| EVM | Log | event | - | parseevmLogData | - |
| EVMAccounts | bind_evm_address | extrinsic | - | - | evm.ts |
| EVMAccounts | Bound | event | - | parseevmAccountsBoundData | - |
| HSM | CollateralAdded | event | - | parsehsmCollateralAddedData | - |
| HSM | CollateralRemoved | event | - | parsehsmCollateralRemovedData | - |
| HSM | CollateralUpdated | event | - | parsehsmCollateralUpdatedData | - |
| LBP | PoolCreated | event | - | parselbpPoolCreatedData | - |
| LBP | PoolUpdated | event | - | parselbpPoolUpdatedData | - |
| LBP | SellExecuted | event | - | parselbpSellExecutedData | - |
| LBP | BuyExecuted | event | - | parselbpBuyExecutedData | - |
| MultiTransactionPayment | set_currency | extrinsic | - | - | payments.ts |
| MultiTransactionPayment | dispatch_permit | extrinsic | - | - | tx.ts |
| OTC | place_order | extrinsic | - | - | PlaceOrderModalContent.submit.ts |
| OTC | partial_fill_order | extrinsic | - | - | FillOrderModalContent.submit.ts |
| OTC | fill_order | extrinsic | - | - | FillOrderModalContent.submit.ts |
| OTC | cancel_order | extrinsic | - | - | CancelOtcOrderModalContent.submit.ts |
| OTC | Cancelled | event | - | handleOtcOrderCancelled | - |
| OTC | Filled | event | - | handleOtcOrderFilled | - |
| OTC | PartiallyFilled | event | - | handleOtcOrderPartiallyFilled | - |
| OTC | Placed | event | - | handleOtcOrderPlaced | - |
| Omnipool | add_liquidity | extrinsic | - | - | AddMoneyMarketLiquidity.utils.tsx |
| Omnipool | remove_liquidity | extrinsic | - | - | RemoveOmnipoolLiquidity.utils.ts |
| Omnipool | sell | extrinsic | Omnipool.sell | - | - |
| Omnipool | buy | extrinsic | Omnipool.buy | - | - |
| Omnipool | add_liquidity_with_limit | extrinsic | - | - | AddMoneyMarketLiquidity.utils.tsx |
| Omnipool | remove_liquidity_with_limit | extrinsic | - | - | RemoveOmnipoolLiquidity.utils.ts |
| Omnipool | TokenAdded | event | - | parseomnipoolTokenAddedData | - |
| Omnipool | TokenRemoved | event | - | parseomnipoolTokenRemovedData | - |
| Omnipool | LiquidityAdded | event | - | parseomnipoolLiquidityAddedData | - |
| Omnipool | LiquidityRemoved | event | - | parseomnipoolLiquidityRemovedData | - |
| Omnipool | SellExecuted | event | - | parseomnipoolSellExecutedData | - |
| Omnipool | BuyExecuted | event | - | parseomnipoolBuyExecutedData | - |
| Omnipool | PositionCreated | event | - | parseomnipoolPositionCreatedData | - |
| Omnipool | PositionDestroyed | event | - | parseomnipoolPositionDestroyedData | - |
| Omnipool | PositionUpdated | event | - | parseomnipoolPositionUpdatedData | - |
| OmnipoolLiquidityMining | deposit_shares | extrinsic | - | - | JoinFarms.utils.ts |
| OmnipoolLiquidityMining | redeposit_shares | extrinsic | - | - | JoinFarms.utils.ts |
| OmnipoolLiquidityMining | claim_rewards | extrinsic | - | - | ClaimRewardsButton.utils.ts |
| OmnipoolLiquidityMining | withdraw_shares | extrinsic | - | - | RemoveOmnipoolLiquidity.utils.ts |
| OmnipoolLiquidityMining | join_farms | extrinsic | - | - | AddMoneyMarketLiquidity.utils.tsx |
| OmnipoolLiquidityMining | add_liquidity_and_join_farms | extrinsic | - | - | AddMoneyMarketLiquidity.utils.tsx |
| OmnipoolLiquidityMining | add_liquidity_stableswap_omnipool_and_join_farms | extrinsic | - | - | AddStablepoolLiquidity.utils.ts |
| OmnipoolLiquidityMining | GlobalFarmCreated | event | - | parseomnipoolLiquidityMiningGlobalFarmCreatedData | - |
| OmnipoolLiquidityMining | GlobalFarmUpdated | event | - | parseomnipoolLiquidityMiningGlobalFarmUpdatedData | - |
| OmnipoolLiquidityMining | GlobalFarmTerminated | event | - | parseomnipoolLiquidityMiningGlobalFarmTerminatedData | - |
| OmnipoolLiquidityMining | YieldFarmCreated | event | - | parseomnipoolLiquidityMiningYieldFarmCreatedData | - |
| OmnipoolLiquidityMining | YieldFarmUpdated | event | - | parseomnipoolLiquidityMiningYieldFarmUpdatedData | - |
| OmnipoolLiquidityMining | YieldFarmStopped | event | - | parseomnipoolLiquidityMiningYieldFarmStoppedData | - |
| OmnipoolLiquidityMining | YieldFarmResumed | event | - | parseomnipoolLiquidityMiningYieldFarmResumedData | - |
| OmnipoolLiquidityMining | YieldFarmTerminated | event | - | parseomnipoolLiquidityMiningYieldFarmTerminatedData | - |
| OmnipoolLiquidityMining | SharesDeposited | event | - | parseomnipoolLiquidityMiningSharesDepositedData | - |
| OmnipoolLiquidityMining | SharesRedeposited | event | - | parseomnipoolLiquidityMiningSharesRedepositedData | - |
| OmnipoolLiquidityMining | RewardClaimed | event | - | parseomnipoolLiquidityMiningRewardClaimedData | - |
| OmnipoolLiquidityMining | SharesWithdrawn | event | - | parseomnipoolLiquidityMiningSharesWithdrawnData | - |
| OmnipoolLiquidityMining | DepositDestroyed | event | - | parseomnipoolLiquidityMiningDepositDestroyedData | - |
| OmnipoolWarehouseLM | GlobalFarmAccRPZUpdated | event | - | parseomnipoolWarehouseLMWarehouseLMGlobalFarmAccRPZUpdatedData | - |
| OmnipoolWarehouseLM | YieldFarmAccRPVSUpdated | event | - | parseomnipoolWarehouseLMYieldFarmAccRPVSUpdatedData | - |
| OmnipoolWarehouseLM | AllRewardsDistributed | event | - | parseomnipoolWarehouseLMAllRewardsDistributedData | - |
| Referrals | claim_rewards | extrinsic | - | - | WalletRewardsSection.claim.ts |
| Router | sell | extrinsic | Router.sell | - | - |
| Router | buy | extrinsic | Router.buy | - | - |
| Router | sell_all | extrinsic | Router.sell_all | - | - |
| Stableswap | add_liquidity | extrinsic | - | - | AddStablepoolLiquidity.utils.ts |
| Stableswap | remove_liquidity_one_asset | extrinsic | - | - | RemoveStablepoolLiquidity.utils.ts |
| Stableswap | remove_liquidity | extrinsic | - | - | RemoveStablepoolLiquidity.utils.ts |
| Stableswap | add_assets_liquidity | extrinsic | - | - | AddStablepoolLiquidity.utils.ts |
| Stableswap | PoolCreated | event | - | parsestableswapPoolCreatedData | - |
| Stableswap | LiquidityAdded | event | - | parsestableswapLiquidityAddedData | - |
| Stableswap | LiquidityRemoved | event | - | parsestableswapLiquidityRemovedData | - |
| Stableswap | SellExecuted | event | - | parsestableswapSellExecutedData | - |
| Stableswap | BuyExecuted | event | - | parsestableswapBuyExecutedData | - |
| Staking | stake | extrinsic | - | - | Stake.stake.ts |
| Staking | increase_stake | extrinsic | - | - | Stake.stake.ts |
| Staking | claim | extrinsic | - | - | ClaimStaking.tx.ts |
| Staking | unstake | extrinsic | - | - | Stake.unstake.ts |
| Tokens | transfer | extrinsic | - | - | TransferPositionModal.submit.ts |
| Tokens | Transfer | event | - | parsetokensTransferData | - |
| Uniques | Transferred | event | - | handleUniquesItemTransferred | - |
| Utility | batch | extrinsic | - | - | WalletRewardsSection.claim.ts |
| Utility | batch_all | extrinsic | - | - | WalletRewardsSection.claim.ts |
| XYK | create_pool | extrinsic | - | - | CreateIsolatedPool.utils.ts |
| XYK | add_liquidity | extrinsic | - | - | AddIsolatedLiquidity.utils.ts |
| XYK | remove_liquidity | extrinsic | - | - | RemoveIsolatedPoolLiquidity.uitls.tsx |
| XYK | remove_liquidity_with_limits | extrinsic | - | - | RemoveIsolatedPoolLiquidity.uitls.tsx |
| XYK | LiquidityAdded | event | - | parsexykLiquidityAddedData | - |
| XYK | LiquidityRemoved | event | - | parsexykLiquidityRemovedData | - |
| XYK | PoolCreated | event | - | parsexykPoolCreatedData | - |
| XYK | PoolDestroyed | event | - | parsexykPoolDestroyedData | - |
| XYK | SellExecuted | event | - | parsexykSellExecutedData | - |
| XYK | BuyExecuted | event | - | parsexykBuyExecutedData | - |
| XYKLiquidityMining | deposit_shares | extrinsic | - | - | JoinFarms.utils.ts |
| XYKLiquidityMining | redeposit_shares | extrinsic | - | - | JoinFarms.utils.ts |
| XYKLiquidityMining | claim_rewards | extrinsic | - | - | ClaimRewardsButton.utils.ts |
| XYKLiquidityMining | withdraw_shares | extrinsic | - | - | RemoveIsolatedPoolLiquidity.uitls.tsx |
| XYKLiquidityMining | join_farms | extrinsic | - | - | AddIsolatedLiquidity.utils.ts |
| XYKLiquidityMining | add_liquidity_and_join_farms | extrinsic | - | - | AddIsolatedLiquidity.utils.ts |
| XYKLiquidityMining | GlobalFarmCreated | event | - | parsexykLiquidityMiningGlobalFarmCreatedData | - |
| XYKLiquidityMining | GlobalFarmUpdated | event | - | parsexykLiquidityMiningGlobalFarmUpdatedData | - |
| XYKLiquidityMining | YieldFarmCreated | event | - | parsexykLiquidityMiningYieldFarmCreatedData | - |
| XYKLiquidityMining | GlobalFarmTerminated | event | - | parsexykLiquidityMiningGlobalFarmTerminatedData | - |
| XYKLiquidityMining | SharesDeposited | event | - | parsexykLiquidityMiningSharesDepositedData | - |
| XYKLiquidityMining | SharesRedeposited | event | - | parsexykLiquidityMiningSharesRedepositedData | - |
| XYKLiquidityMining | RewardClaimed | event | - | parsexykLiquidityMiningRewardClaimedData | - |
| XYKLiquidityMining | SharesWithdrawn | event | - | parsexykLiquidityMiningSharesWithdrawnData | - |
| XYKLiquidityMining | YieldFarmResumed | event | - | parsexykLiquidityMiningYieldFarmResumedData | - |
| XYKLiquidityMining | YieldFarmTerminated | event | - | parsexykLiquidityMiningYieldFarmTerminatedData | - |
| XYKLiquidityMining | YieldFarmUpdated | event | - | parsexykLiquidityMiningYieldFarmUpdatedData | - |
| XYKLiquidityMining | DepositDestroyed | event | - | parsexykLiquidityMiningDepositDestroyedData | - |


## Gaps

### Unindexed Events (334)

- System.ExtrinsicSuccess
- System.ExtrinsicFailed
- System.CodeUpdated
- System.NewAccount
- System.KilledAccount
- System.Remarked
- System.UpgradeAuthorized
- Balances.Endowed
- Balances.DustLost
- Balances.BalanceSet
- Balances.Reserved
- Balances.Unreserved
- Balances.ReserveRepatriated
- Balances.Deposit
- Balances.Withdraw
- Balances.Slashed
- Balances.Minted
- Balances.Burned
- Balances.Suspended
- Balances.Restored
- Balances.Upgraded
- Balances.Issued
- Balances.Rescinded
- Balances.Locked
- Balances.Unlocked
- Balances.Frozen
- Balances.Thawed
- Balances.TotalIssuanceForced
- TransactionPayment.TransactionFeePaid
- MultiTransactionPayment.CurrencySet
- MultiTransactionPayment.CurrencyAdded
- MultiTransactionPayment.CurrencyRemoved
- MultiTransactionPayment.FeeWithdrawn
- Treasury.Spending
- Treasury.Awarded
- Treasury.Burnt
- Treasury.Rollover
- Treasury.Deposit
- Treasury.SpendApproved
- Treasury.UpdatedInactive
- Treasury.AssetSpendApproved
- Treasury.AssetSpendVoided
- Treasury.Paid
- Treasury.PaymentFailed
- Treasury.SpendProcessed
- Utility.BatchInterrupted
- Utility.BatchCompleted
- Utility.BatchCompletedWithErrors
- Utility.ItemCompleted
- Utility.ItemFailed
- Utility.DispatchedAs
- Preimage.Noted
- Preimage.Requested
- Preimage.Cleared
- Identity.IdentitySet
- Identity.IdentityCleared
- Identity.IdentityKilled
- Identity.JudgementRequested
- Identity.JudgementUnrequested
- Identity.JudgementGiven
- Identity.RegistrarAdded
- Identity.SubIdentityAdded
- Identity.SubIdentityRemoved
- Identity.SubIdentityRevoked
- Identity.AuthorityAdded
- Identity.AuthorityRemoved
- Identity.UsernameSet
- Identity.UsernameQueued
- Identity.PreapprovalExpired
- Identity.PrimaryUsernameSet
- Identity.DanglingUsernameRemoved
- Democracy.Proposed
- Democracy.Tabled
- Democracy.ExternalTabled
- Democracy.Started
- Democracy.Passed
- Democracy.NotPassed
- Democracy.Cancelled
- Democracy.Delegated
- Democracy.Undelegated
- Democracy.Vetoed
- Democracy.Blacklisted
- Democracy.Voted
- Democracy.Seconded
- Democracy.ProposalCanceled
- Democracy.MetadataSet
- Democracy.MetadataCleared
- Democracy.MetadataTransferred
- TechnicalCommittee.Proposed
- TechnicalCommittee.Voted
- TechnicalCommittee.Approved
- TechnicalCommittee.Disapproved
- TechnicalCommittee.Executed
- TechnicalCommittee.MemberExecuted
- TechnicalCommittee.Closed
- Proxy.ProxyExecuted
- Proxy.PureCreated
- Proxy.Announced
- Proxy.ProxyAdded
- Proxy.ProxyRemoved
- Multisig.NewMultisig
- Multisig.MultisigApproval
- Multisig.MultisigExecuted
- Multisig.MultisigCancelled
- Uniques.Created
- Uniques.ForceCreated
- Uniques.Destroyed
- Uniques.Issued
- Uniques.Burned
- Uniques.Frozen
- Uniques.Thawed
- Uniques.CollectionFrozen
- Uniques.CollectionThawed
- Uniques.OwnerChanged
- Uniques.TeamChanged
- Uniques.ApprovedTransfer
- Uniques.ApprovalCancelled
- Uniques.ItemStatusChanged
- Uniques.CollectionMetadataSet
- Uniques.CollectionMetadataCleared
- Uniques.MetadataSet
- Uniques.MetadataCleared
- Uniques.Redeposited
- Uniques.AttributeSet
- Uniques.AttributeCleared
- Uniques.OwnershipAcceptanceChanged
- Uniques.CollectionMaxSupplySet
- Uniques.ItemPriceSet
- Uniques.ItemPriceRemoved
- Uniques.ItemBought
- StateTrieMigration.Migrated
- StateTrieMigration.Slashed
- StateTrieMigration.AutoMigrationFinished
- StateTrieMigration.Halted
- ConvictionVoting.Delegated
- ConvictionVoting.Undelegated
- ConvictionVoting.Voted
- ConvictionVoting.VoteRemoved
- Referenda.Submitted
- Referenda.DecisionDepositPlaced
- Referenda.DecisionDepositRefunded
- Referenda.DepositSlashed
- Referenda.DecisionStarted
- Referenda.ConfirmStarted
- Referenda.ConfirmAborted
- Referenda.Confirmed
- Referenda.Approved
- Referenda.Rejected
- Referenda.TimedOut
- Referenda.Cancelled
- Referenda.Killed
- Referenda.SubmissionDepositRefunded
- Referenda.MetadataSet
- Referenda.MetadataCleared
- Whitelist.CallWhitelisted
- Whitelist.WhitelistedCallRemoved
- Whitelist.WhitelistedCallDispatched
- Dispatcher.TreasuryManagerCallDispatched
- Dispatcher.AaveManagerCallDispatched
- AssetRegistry.ExistentialDepositPaid
- AssetRegistry.AssetBanned
- AssetRegistry.AssetUnbanned
- Claims.Claim
- CollatorRewards.CollatorRewarded
- Omnipool.ProtocolLiquidityRemoved
- Omnipool.TradableStateUpdated
- Omnipool.AssetRefunded
- Omnipool.AssetWeightCapUpdated
- TransactionPause.TransactionPaused
- TransactionPause.TransactionUnpaused
- Duster.Dusted
- Duster.Added
- Duster.Removed
- CircuitBreaker.TradeVolumeLimitChanged
- CircuitBreaker.AddLiquidityLimitChanged
- CircuitBreaker.RemoveLiquidityLimitChanged
- CircuitBreaker.AssetLockdown
- CircuitBreaker.AssetLockdownRemoved
- CircuitBreaker.DepositReleased
- Router.Executed
- Router.RouteUpdated
- DynamicFees.AssetFeeConfigSet
- DynamicFees.AssetFeeConfigRemoved
- Staking.PositionCreated
- Staking.StakeAdded
- Staking.RewardsClaimed
- Staking.Unstaked
- Staking.StakingInitialized
- Staking.AccumulatedRpsUpdated
- Stableswap.FeeUpdated
- Stableswap.TradableStateUpdated
- Stableswap.AmplificationChanging
- Stableswap.PoolDestroyed
- Stableswap.PoolPegSourceUpdated
- Stableswap.PoolMaxPegUpdateUpdated
- Bonds.TokenCreated
- Bonds.Issued
- Bonds.Redeemed
- OtcSettlements.Executed
- LBP.LiquidityAdded
- LBP.LiquidityRemoved
- Referrals.CodeRegistered
- Referrals.CodeLinked
- Referrals.Converted
- Referrals.Claimed
- Referrals.AssetRewardsUpdated
- Referrals.LevelUp
- Liquidation.Liquidated
- HSM.ArbitrageExecuted
- HSM.FlashMinterSet
- Tokens.Endowed
- Tokens.DustLost
- Tokens.Reserved
- Tokens.Unreserved
- Tokens.ReserveRepatriated
- Tokens.BalanceSet
- Tokens.TotalIssuanceSet
- Tokens.Withdrawn
- Tokens.Slashed
- Tokens.Deposited
- Tokens.LockSet
- Tokens.LockRemoved
- Tokens.Locked
- Tokens.Unlocked
- Tokens.Issued
- Tokens.Rescinded
- Currencies.BalanceUpdated
- Currencies.Deposited
- Currencies.Withdrawn
- Vesting.VestingScheduleAdded
- Vesting.Claimed
- Vesting.VestingSchedulesUpdated
- EVM.Created
- EVM.CreatedFailed
- EVM.Executed
- EVM.ExecutedFailed
- Ethereum.Executed
- EVMAccounts.DeployerAdded
- EVMAccounts.DeployerRemoved
- EVMAccounts.ContractApproved
- EVMAccounts.ContractDisapproved
- XYKLiquidityMining.YieldFarmStopped
- XYKWarehouseLM.GlobalFarmAccRPZUpdated
- XYKWarehouseLM.YieldFarmAccRPVSUpdated
- XYKWarehouseLM.AllRewardsDistributed
- RelayChainInfo.CurrentBlockNumbers
- DCA.ExecutionStarted
- DCA.ReserveUnlocked
- Scheduler.Scheduled
- Scheduler.Canceled
- Scheduler.Dispatched
- Scheduler.RetrySet
- Scheduler.RetryCancelled
- Scheduler.CallUnavailable
- Scheduler.PeriodicFailed
- Scheduler.RetryFailed
- Scheduler.PermanentlyOverweight
- ParachainSystem.ValidationFunctionStored
- ParachainSystem.ValidationFunctionApplied
- ParachainSystem.ValidationFunctionDiscarded
- ParachainSystem.DownwardMessagesReceived
- ParachainSystem.DownwardMessagesProcessed
- ParachainSystem.UpwardMessageSent
- PolkadotXcm.Attempted
- PolkadotXcm.Sent
- PolkadotXcm.UnexpectedResponse
- PolkadotXcm.ResponseReady
- PolkadotXcm.Notified
- PolkadotXcm.NotifyOverweight
- PolkadotXcm.NotifyDispatchError
- PolkadotXcm.NotifyDecodeFailed
- PolkadotXcm.InvalidResponder
- PolkadotXcm.InvalidResponderVersion
- PolkadotXcm.ResponseTaken
- PolkadotXcm.AssetsTrapped
- PolkadotXcm.VersionChangeNotified
- PolkadotXcm.SupportedVersionChanged
- PolkadotXcm.NotifyTargetSendFail
- PolkadotXcm.NotifyTargetMigrationFail
- PolkadotXcm.InvalidQuerierVersion
- PolkadotXcm.InvalidQuerier
- PolkadotXcm.VersionNotifyStarted
- PolkadotXcm.VersionNotifyRequested
- PolkadotXcm.VersionNotifyUnrequested
- PolkadotXcm.FeesPaid
- PolkadotXcm.AssetsClaimed
- PolkadotXcm.VersionMigrationFinished
- CumulusXcm.InvalidFormat
- CumulusXcm.UnsupportedVersion
- CumulusXcm.ExecutedDownward
- XcmpQueue.XcmpMessageSent
- MessageQueue.ProcessingFailed
- MessageQueue.Processed
- MessageQueue.OverweightEnqueued
- MessageQueue.PageReaped
- OrmlXcm.Sent
- XTokens.TransferredAssets
- UnknownTokens.Deposited
- UnknownTokens.Withdrawn
- CollatorSelection.NewInvulnerables
- CollatorSelection.InvulnerableAdded
- CollatorSelection.InvulnerableRemoved
- CollatorSelection.NewDesiredCandidates
- CollatorSelection.NewCandidacyBond
- CollatorSelection.CandidateAdded
- CollatorSelection.CandidateBondUpdated
- CollatorSelection.CandidateRemoved
- CollatorSelection.CandidateReplaced
- CollatorSelection.InvalidInvulnerableSkipped
- Session.NewSession
- Ismp.StateMachineUpdated
- Ismp.StateCommitmentVetoed
- Ismp.ConsensusClientCreated
- Ismp.ConsensusClientFrozen
- Ismp.Response
- Ismp.Request
- Ismp.Errors
- Ismp.PostRequestHandled
- Ismp.PostResponseHandled
- Ismp.GetRequestHandled
- Ismp.PostRequestTimeoutHandled
- Ismp.PostResponseTimeoutHandled
- Ismp.GetRequestTimeoutHandled
- IsmpParachain.ParachainsAdded
- IsmpParachain.ParachainsRemoved
- Hyperbridge.HostParamsUpdated
- Hyperbridge.RelayerFeeWithdrawn
- Hyperbridge.ProtocolRevenueWithdrawn
- TokenGateway.AssetTeleported
- TokenGateway.AssetReceived
- TokenGateway.AssetRefunded
- TokenGateway.ERC6160AssetRegistrationDispatched
- EmaOracle.AddedToWhitelist
- EmaOracle.RemovedFromWhitelist

### Unwrapped Extrinsics (315)

- System.remark
- System.set_heap_pages
- System.set_code
- System.set_code_without_checks
- System.set_storage
- System.kill_storage
- System.kill_prefix
- System.remark_with_event
- System.authorize_upgrade
- System.authorize_upgrade_without_checks
- System.apply_authorized_upgrade
- Timestamp.set
- Balances.transfer_allow_death
- Balances.force_transfer
- Balances.transfer_keep_alive
- Balances.transfer_all
- Balances.force_unreserve
- Balances.upgrade_accounts
- Balances.force_set_balance
- Balances.force_adjust_total_issuance
- Balances.burn
- MultiTransactionPayment.add_currency
- MultiTransactionPayment.remove_currency
- MultiTransactionPayment.reset_payment_currency
- Treasury.spend_local
- Treasury.remove_approval
- Treasury.spend
- Treasury.payout
- Treasury.check_status
- Treasury.void_spend
- Utility.as_derivative
- Utility.dispatch_as
- Utility.force_batch
- Utility.with_weight
- Preimage.note_preimage
- Preimage.unnote_preimage
- Preimage.request_preimage
- Preimage.unrequest_preimage
- Preimage.ensure_updated
- Identity.add_registrar
- Identity.set_identity
- Identity.set_subs
- Identity.clear_identity
- Identity.request_judgement
- Identity.cancel_request
- Identity.set_fee
- Identity.set_account_id
- Identity.set_fields
- Identity.provide_judgement
- Identity.kill_identity
- Identity.add_sub
- Identity.rename_sub
- Identity.remove_sub
- Identity.quit_sub
- Identity.add_username_authority
- Identity.remove_username_authority
- Identity.set_username_for
- Identity.accept_username
- Identity.remove_expired_approval
- Identity.set_primary_username
- Identity.remove_dangling_username
- Democracy.propose
- Democracy.second
- Democracy.emergency_cancel
- Democracy.external_propose
- Democracy.external_propose_majority
- Democracy.external_propose_default
- Democracy.fast_track
- Democracy.veto_external
- Democracy.cancel_referendum
- Democracy.delegate
- Democracy.undelegate
- Democracy.clear_public_proposals
- Democracy.remove_other_vote
- Democracy.blacklist
- Democracy.cancel_proposal
- Democracy.set_metadata
- Democracy.force_remove_vote
- TechnicalCommittee.set_members
- TechnicalCommittee.execute
- TechnicalCommittee.propose
- TechnicalCommittee.vote
- TechnicalCommittee.disapprove_proposal
- TechnicalCommittee.close
- Proxy.proxy
- Proxy.add_proxy
- Proxy.remove_proxy
- Proxy.remove_proxies
- Proxy.create_pure
- Proxy.kill_pure
- Proxy.announce
- Proxy.remove_announcement
- Proxy.reject_announcement
- Proxy.proxy_announced
- Multisig.as_multi_threshold_1
- Multisig.as_multi
- Multisig.approve_as_multi
- Multisig.cancel_as_multi
- Uniques.create
- Uniques.force_create
- Uniques.destroy
- Uniques.mint
- Uniques.burn
- Uniques.transfer
- Uniques.redeposit
- Uniques.freeze
- Uniques.thaw
- Uniques.freeze_collection
- Uniques.thaw_collection
- Uniques.transfer_ownership
- Uniques.set_team
- Uniques.approve_transfer
- Uniques.cancel_approval
- Uniques.force_item_status
- Uniques.set_attribute
- Uniques.clear_attribute
- Uniques.set_metadata
- Uniques.clear_metadata
- Uniques.set_collection_metadata
- Uniques.clear_collection_metadata
- Uniques.set_accept_ownership
- Uniques.set_collection_max_supply
- Uniques.set_price
- Uniques.buy_item
- StateTrieMigration.control_auto_migration
- StateTrieMigration.continue_migrate
- StateTrieMigration.migrate_custom_top
- StateTrieMigration.migrate_custom_child
- StateTrieMigration.set_signed_max_limits
- StateTrieMigration.force_set_progress
- ConvictionVoting.delegate
- ConvictionVoting.undelegate
- ConvictionVoting.unlock
- ConvictionVoting.remove_other_vote
- ConvictionVoting.force_remove_vote
- Referenda.submit
- Referenda.place_decision_deposit
- Referenda.refund_decision_deposit
- Referenda.cancel
- Referenda.kill
- Referenda.nudge_referendum
- Referenda.one_fewer_deciding
- Referenda.refund_submission_deposit
- Referenda.set_metadata
- Whitelist.whitelist_call
- Whitelist.remove_whitelisted_call
- Whitelist.dispatch_whitelisted_call
- Whitelist.dispatch_whitelisted_call_with_preimage
- Dispatcher.dispatch_as_treasury
- Dispatcher.dispatch_as_aave_manager
- Dispatcher.note_aave_manager
- AssetRegistry.register
- AssetRegistry.update
- AssetRegistry.register_external
- AssetRegistry.ban_asset
- AssetRegistry.unban_asset
- Claims.claim
- Omnipool.add_token
- Omnipool.sacrifice_position
- Omnipool.set_asset_tradable_state
- Omnipool.refund_refused_asset
- Omnipool.set_asset_weight_cap
- Omnipool.withdraw_protocol_liquidity
- Omnipool.remove_token
- TransactionPause.pause_transaction
- TransactionPause.unpause_transaction
- Duster.dust_account
- Duster.whitelist_account
- Duster.remove_from_whitelist
- OmnipoolLiquidityMining.create_global_farm
- OmnipoolLiquidityMining.terminate_global_farm
- OmnipoolLiquidityMining.create_yield_farm
- OmnipoolLiquidityMining.update_yield_farm
- OmnipoolLiquidityMining.stop_yield_farm
- OmnipoolLiquidityMining.resume_yield_farm
- OmnipoolLiquidityMining.terminate_yield_farm
- OmnipoolLiquidityMining.update_global_farm
- OmnipoolLiquidityMining.exit_farms
- CircuitBreaker.set_trade_volume_limit
- CircuitBreaker.set_add_liquidity_limit
- CircuitBreaker.set_remove_liquidity_limit
- CircuitBreaker.lockdown_asset
- CircuitBreaker.force_lift_lockdown
- CircuitBreaker.release_deposit
- Router.set_route
- Router.force_insert_route
- DynamicFees.set_asset_fee
- DynamicFees.remove_asset_fee
- Staking.initialize_staking
- Stableswap.create_pool
- Stableswap.update_pool_fee
- Stableswap.update_amplification
- Stableswap.add_liquidity_shares
- Stableswap.withdraw_asset_amount
- Stableswap.sell
- Stableswap.buy
- Stableswap.set_asset_tradable_state
- Stableswap.create_pool_with_pegs
- Stableswap.update_asset_peg_source
- Stableswap.update_pool_max_peg_update
- Bonds.issue
- Bonds.redeem
- OtcSettlements.settle_otc_order
- LBP.create_pool
- LBP.update_pool_data
- LBP.add_liquidity
- LBP.remove_liquidity
- LBP.sell
- LBP.buy
- XYK.sell
- XYK.buy
- XYK.add_liquidity_with_limits
- Referrals.register_code
- Referrals.link_code
- Referrals.convert
- Referrals.set_reward_percentage
- Liquidation.liquidate
- Liquidation.set_borrowing_contract
- HSM.add_collateral_asset
- HSM.remove_collateral_asset
- HSM.update_collateral_asset
- HSM.sell
- HSM.buy
- HSM.execute_arbitrage
- HSM.set_flash_minter
- Tokens.transfer_all
- Tokens.transfer_keep_alive
- Tokens.force_transfer
- Tokens.set_balance
- Currencies.transfer_native_currency
- Currencies.update_balance
- Vesting.claim
- Vesting.vested_transfer
- Vesting.update_vesting_schedules
- Vesting.claim_for
- EVM.withdraw
- EVM.create
- EVM.create2
- Ethereum.transact
- EVMAccounts.add_contract_deployer
- EVMAccounts.remove_contract_deployer
- EVMAccounts.renounce_contract_deployer
- EVMAccounts.approve_contract
- EVMAccounts.disapprove_contract
- XYKLiquidityMining.create_global_farm
- XYKLiquidityMining.update_global_farm
- XYKLiquidityMining.terminate_global_farm
- XYKLiquidityMining.create_yield_farm
- XYKLiquidityMining.update_yield_farm
- XYKLiquidityMining.stop_yield_farm
- XYKLiquidityMining.resume_yield_farm
- XYKLiquidityMining.terminate_yield_farm
- XYKLiquidityMining.exit_farms
- DCA.unlock_reserves
- Scheduler.schedule
- Scheduler.cancel
- Scheduler.schedule_named
- Scheduler.cancel_named
- Scheduler.schedule_after
- Scheduler.schedule_named_after
- Scheduler.set_retry
- Scheduler.set_retry_named
- Scheduler.cancel_retry
- Scheduler.cancel_retry_named
- ParachainSystem.set_validation_data
- ParachainSystem.sudo_send_upward_message
- PolkadotXcm.send
- PolkadotXcm.teleport_assets
- PolkadotXcm.reserve_transfer_assets
- PolkadotXcm.execute
- PolkadotXcm.force_xcm_version
- PolkadotXcm.force_default_xcm_version
- PolkadotXcm.force_subscribe_version_notify
- PolkadotXcm.force_unsubscribe_version_notify
- PolkadotXcm.limited_reserve_transfer_assets
- PolkadotXcm.limited_teleport_assets
- PolkadotXcm.force_suspension
- PolkadotXcm.transfer_assets
- PolkadotXcm.claim_assets
- PolkadotXcm.transfer_assets_using_type_and_then
- MessageQueue.reap_page
- MessageQueue.execute_overweight
- OrmlXcm.send_as_sovereign
- XTokens.transfer
- XTokens.transfer_multiasset
- XTokens.transfer_with_fee
- XTokens.transfer_multiasset_with_fee
- XTokens.transfer_multicurrencies
- XTokens.transfer_multiassets
- CollatorSelection.set_invulnerables
- CollatorSelection.set_desired_candidates
- CollatorSelection.set_candidacy_bond
- CollatorSelection.register_as_candidate
- CollatorSelection.leave_intent
- CollatorSelection.add_invulnerable
- CollatorSelection.remove_invulnerable
- CollatorSelection.update_bond
- CollatorSelection.take_candidate_slot
- Session.set_keys
- Session.purge_keys
- Ismp.handle_unsigned
- Ismp.create_consensus_client
- Ismp.update_consensus_state
- Ismp.fund_message
- IsmpParachain.update_parachain_consensus
- IsmpParachain.add_parachain
- IsmpParachain.remove_parachain
- TokenGateway.teleport
- TokenGateway.set_token_gateway_addresses
- TokenGateway.create_erc6160_asset
- TokenGateway.update_erc6160_asset
- TokenGateway.update_asset_precision
- EmaOracle.add_oracle
- EmaOracle.remove_oracle
- EmaOracle.update_bifrost_oracle

