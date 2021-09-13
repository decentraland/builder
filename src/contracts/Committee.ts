import BN from 'bn.js'
import { Address } from 'web3x/address'
import { EventLog, TransactionReceipt } from 'web3x/formatters'
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import abi from './CommitteeAbi'
export type MemberSetEvent = {
  _member: Address
  _value: boolean
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
export interface MemberSetEventLog extends EventLog<MemberSetEvent, 'MemberSet'> {}
export interface MetaTransactionExecutedEventLog extends EventLog<MetaTransactionExecutedEvent, 'MetaTransactionExecuted'> {}
export interface OwnershipTransferredEventLog extends EventLog<OwnershipTransferredEvent, 'OwnershipTransferred'> {}
interface CommitteeEvents {
  MemberSet: EventSubscriptionFactory<MemberSetEventLog>
  MetaTransactionExecuted: EventSubscriptionFactory<MetaTransactionExecutedEventLog>
  OwnershipTransferred: EventSubscriptionFactory<OwnershipTransferredEventLog>
}
interface CommitteeEventLogs {
  MemberSet: MemberSetEventLog
  MetaTransactionExecuted: MetaTransactionExecutedEventLog
  OwnershipTransferred: OwnershipTransferredEventLog
}
interface CommitteeTxEventLogs {
  MemberSet: MemberSetEventLog[]
  MetaTransactionExecuted: MetaTransactionExecutedEventLog[]
  OwnershipTransferred: OwnershipTransferredEventLog[]
}
export interface CommitteeTransactionReceipt extends TransactionReceipt<CommitteeTxEventLogs> {}
interface CommitteeMethods {
  domainSeparator(): TxCall<string>
  executeMetaTransaction(
    userAddress: Address,
    functionSignature: string,
    sigR: string,
    sigS: string,
    sigV: number | string | BN
  ): TxSend<CommitteeTransactionReceipt>
  getChainId(): TxCall<string>
  getNonce(user: Address): TxCall<string>
  manageCollection(
    _collectionManager: Address,
    _forwarder: Address,
    _collection: Address,
    _data: string
  ): TxSend<CommitteeTransactionReceipt>
  members(a0: Address): TxCall<boolean>
  owner(): TxCall<Address>
  renounceOwnership(): TxSend<CommitteeTransactionReceipt>
  setMembers(_members: Address[], _values: boolean[]): TxSend<CommitteeTransactionReceipt>
  transferOwnership(newOwner: Address): TxSend<CommitteeTransactionReceipt>
}
export interface CommitteeDefinition {
  methods: CommitteeMethods
  events: CommitteeEvents
  eventLogs: CommitteeEventLogs
}
export class Committee extends Contract<CommitteeDefinition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
}
export var CommitteeAbi = abi
