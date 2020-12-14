import BN from 'bn.js'
import { Address } from 'web3x-es/address'
import { EventLog, TransactionReceipt } from 'web3x-es/formatters'
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from 'web3x-es/contract'
import { Eth } from 'web3x-es/eth'
import abi from './DCLControllerAbi'
export type MaxGasPriceChangedEvent = {
  _oldMaxGasPrice: string
  _newMaxGasPrice: string
}
export type NameBoughtEvent = {
  _caller: Address
  _beneficiary: Address
  _price: string
  _name: string
}
export type OwnershipTransferredEvent = {
  previousOwner: Address
  newOwner: Address
}
export interface MaxGasPriceChangedEventLog extends EventLog<MaxGasPriceChangedEvent, 'MaxGasPriceChanged'> {}
export interface NameBoughtEventLog extends EventLog<NameBoughtEvent, 'NameBought'> {}
export interface OwnershipTransferredEventLog extends EventLog<OwnershipTransferredEvent, 'OwnershipTransferred'> {}
interface DCLControllerEvents {
  MaxGasPriceChanged: EventSubscriptionFactory<MaxGasPriceChangedEventLog>
  NameBought: EventSubscriptionFactory<NameBoughtEventLog>
  OwnershipTransferred: EventSubscriptionFactory<OwnershipTransferredEventLog>
}
interface DCLControllerEventLogs {
  MaxGasPriceChanged: MaxGasPriceChangedEventLog
  NameBought: NameBoughtEventLog
  OwnershipTransferred: OwnershipTransferredEventLog
}
interface DCLControllerTxEventLogs {
  MaxGasPriceChanged: MaxGasPriceChangedEventLog[]
  NameBought: NameBoughtEventLog[]
  OwnershipTransferred: OwnershipTransferredEventLog[]
}
export interface DCLControllerTransactionReceipt extends TransactionReceipt<DCLControllerTxEventLogs> {}
interface DCLControllerMethods {
  PRICE(): TxCall<string>
  acceptedToken(): TxCall<Address>
  isOwner(): TxCall<boolean>
  maxGasPrice(): TxCall<string>
  owner(): TxCall<Address>
  register(_name: string, _beneficiary: Address): TxSend<DCLControllerTransactionReceipt>
  registrar(): TxCall<Address>
  renounceOwnership(): TxSend<DCLControllerTransactionReceipt>
  transferOwnership(newOwner: Address): TxSend<DCLControllerTransactionReceipt>
  updateMaxGasPrice(_maxGasPrice: number | string | BN): TxSend<DCLControllerTransactionReceipt>
}
export interface DCLControllerDefinition {
  methods: DCLControllerMethods
  events: DCLControllerEvents
  eventLogs: DCLControllerEventLogs
}
export class DCLController extends Contract<DCLControllerDefinition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
}
export const DCLControllerAbi = abi
