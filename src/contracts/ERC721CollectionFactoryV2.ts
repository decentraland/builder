import { Address } from 'web3x/address'
import { EventLog, TransactionReceipt } from 'web3x/formatters'
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import abi from './ERC721CollectionFactoryV2Abi'
export type ImplementationChangedEvent = {
  _implementation: Address
  _codeHash: string
  _code: string
}
export type OwnershipTransferredEvent = {
  previousOwner: Address
  newOwner: Address
}
export type ProxyCreatedEvent = {
  _address: Address
  _salt: string
}
export interface ImplementationChangedEventLog extends EventLog<ImplementationChangedEvent, 'ImplementationChanged'> {}
export interface OwnershipTransferredEventLog extends EventLog<OwnershipTransferredEvent, 'OwnershipTransferred'> {}
export interface ProxyCreatedEventLog extends EventLog<ProxyCreatedEvent, 'ProxyCreated'> {}
interface ERC721CollectionFactoryV2Events {
  ImplementationChanged: EventSubscriptionFactory<ImplementationChangedEventLog>
  OwnershipTransferred: EventSubscriptionFactory<OwnershipTransferredEventLog>
  ProxyCreated: EventSubscriptionFactory<ProxyCreatedEventLog>
}
interface ERC721CollectionFactoryV2EventLogs {
  ImplementationChanged: ImplementationChangedEventLog
  OwnershipTransferred: OwnershipTransferredEventLog
  ProxyCreated: ProxyCreatedEventLog
}
interface ERC721CollectionFactoryV2TxEventLogs {
  ImplementationChanged: ImplementationChangedEventLog[]
  OwnershipTransferred: OwnershipTransferredEventLog[]
  ProxyCreated: ProxyCreatedEventLog[]
}
export interface ERC721CollectionFactoryV2TransactionReceipt extends TransactionReceipt<ERC721CollectionFactoryV2TxEventLogs> {}
interface ERC721CollectionFactoryV2Methods {
  code(): TxCall<string>
  codeHash(): TxCall<string>
  createCollection(_salt: string, _data: string): TxSend<ERC721CollectionFactoryV2TransactionReceipt>
  createProxy(_salt: string, _data: string): TxSend<ERC721CollectionFactoryV2TransactionReceipt>
  getAddress(_salt: string, _address: Address): TxCall<Address>
  implementation(): TxCall<Address>
  owner(): TxCall<Address>
  renounceOwnership(): TxSend<ERC721CollectionFactoryV2TransactionReceipt>
  setImplementation(_implementation: Address): TxSend<ERC721CollectionFactoryV2TransactionReceipt>
  transferOwnership(newOwner: Address): TxSend<ERC721CollectionFactoryV2TransactionReceipt>
}
export interface ERC721CollectionFactoryV2Definition {
  methods: ERC721CollectionFactoryV2Methods
  events: ERC721CollectionFactoryV2Events
  eventLogs: ERC721CollectionFactoryV2EventLogs
}
export class ERC721CollectionFactoryV2 extends Contract<ERC721CollectionFactoryV2Definition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
}
export var ERC721CollectionFactoryV2Abi = abi
