import BN from 'bn.js'
import { Address } from 'web3x/address'
import { EventLog, TransactionReceipt } from 'web3x/formatters'
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import abi from './CollectionManagerAbi'
export type AcceptedTokenSetEvent = {
  _oldAcceptedToken: Address
  _newAcceptedToken: Address
}
export type CommitteeSetEvent = {
  _oldCommittee: Address
  _newCommittee: Address
}
export type FeesCollectorSetEvent = {
  _oldFeesCollector: Address
  _newFeesCollector: Address
}
export type MetaTransactionExecutedEvent = {
  userAddress: Address
  relayerAddress: Address
  functionSignature: string
}
export type OwnershipTransferredEvent = {
  previousOwner: Address
  newOwner: Address
}
export type RaritiesSetEvent = {
  _oldRarities: Address
  _newRarities: Address
}
export interface AcceptedTokenSetEventLog extends EventLog<AcceptedTokenSetEvent, 'AcceptedTokenSet'> {}
export interface CommitteeSetEventLog extends EventLog<CommitteeSetEvent, 'CommitteeSet'> {}
export interface FeesCollectorSetEventLog extends EventLog<FeesCollectorSetEvent, 'FeesCollectorSet'> {}
export interface MetaTransactionExecutedEventLog extends EventLog<MetaTransactionExecutedEvent, 'MetaTransactionExecuted'> {}
export interface OwnershipTransferredEventLog extends EventLog<OwnershipTransferredEvent, 'OwnershipTransferred'> {}
export interface RaritiesSetEventLog extends EventLog<RaritiesSetEvent, 'RaritiesSet'> {}
interface CollectionManagerEvents {
  AcceptedTokenSet: EventSubscriptionFactory<AcceptedTokenSetEventLog>
  CommitteeSet: EventSubscriptionFactory<CommitteeSetEventLog>
  FeesCollectorSet: EventSubscriptionFactory<FeesCollectorSetEventLog>
  MetaTransactionExecuted: EventSubscriptionFactory<MetaTransactionExecutedEventLog>
  OwnershipTransferred: EventSubscriptionFactory<OwnershipTransferredEventLog>
  RaritiesSet: EventSubscriptionFactory<RaritiesSetEventLog>
}
interface CollectionManagerEventLogs {
  AcceptedTokenSet: AcceptedTokenSetEventLog
  CommitteeSet: CommitteeSetEventLog
  FeesCollectorSet: FeesCollectorSetEventLog
  MetaTransactionExecuted: MetaTransactionExecutedEventLog
  OwnershipTransferred: OwnershipTransferredEventLog
  RaritiesSet: RaritiesSetEventLog
}
interface CollectionManagerTxEventLogs {
  AcceptedTokenSet: AcceptedTokenSetEventLog[]
  CommitteeSet: CommitteeSetEventLog[]
  FeesCollectorSet: FeesCollectorSetEventLog[]
  MetaTransactionExecuted: MetaTransactionExecutedEventLog[]
  OwnershipTransferred: OwnershipTransferredEventLog[]
  RaritiesSet: RaritiesSetEventLog[]
}
export interface CollectionManagerTransactionReceipt extends TransactionReceipt<CollectionManagerTxEventLogs> {}
interface CollectionManagerMethods {
  acceptedToken(): TxCall<Address>
  committee(): TxCall<Address>
  createCollection(
    _forwarder: Address,
    _factory: Address,
    _salt: string,
    _name: string,
    _symbol: string,
    _baseURI: string,
    _creator: Address,
    _items: {
      rarity: string
      price: number | string | BN
      beneficiary: Address
      metadata: string
    }[]
  ): TxSend<CollectionManagerTransactionReceipt>
  domainSeparator(): TxCall<string>
  executeMetaTransaction(
    userAddress: Address,
    functionSignature: string,
    sigR: string,
    sigS: string,
    sigV: number | string | BN
  ): TxSend<CollectionManagerTransactionReceipt>
  feesCollector(): TxCall<Address>
  getChainId(): TxCall<string>
  getNonce(user: Address): TxCall<string>
  manageCollection(_forwarder: Address, _collection: Address, _data: string): TxSend<CollectionManagerTransactionReceipt>
  owner(): TxCall<Address>
  pricePerItem(): TxCall<string>
  rarities(): TxCall<Address>
  renounceOwnership(): TxSend<CollectionManagerTransactionReceipt>
  setAcceptedToken(_newAcceptedToken: Address): TxSend<CollectionManagerTransactionReceipt>
  setCommittee(_newCommittee: Address): TxSend<CollectionManagerTransactionReceipt>
  setFeesCollector(_newFeesCollector: Address): TxSend<CollectionManagerTransactionReceipt>
  setRarities(_newRarities: Address): TxSend<CollectionManagerTransactionReceipt>
  transferOwnership(newOwner: Address): TxSend<CollectionManagerTransactionReceipt>
}
export interface CollectionManagerDefinition {
  methods: CollectionManagerMethods
  events: CollectionManagerEvents
  eventLogs: CollectionManagerEventLogs
}
export class CollectionManager extends Contract<CollectionManagerDefinition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
}
export var CollectionManagerAbi = abi
