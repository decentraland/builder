import BN from 'bn.js'
import { Address } from 'web3x/address'
import { EventLog, TransactionReceipt } from 'web3x/formatters'
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import abi from './ENSResolverAbi'
export type AuthorisationChangedEvent = {
  node: string
  owner: Address
  target: Address
  isAuthorised: boolean
}
export type TextChangedEvent = {
  node: string
  indexedKey: string
  key: string
}
export type PubkeyChangedEvent = {
  node: string
  x: string
  y: string
}
export type NameChangedEvent = {
  node: string
  name: string
}
export type InterfaceChangedEvent = {
  node: string
  interfaceID: string
  implementer: Address
}
export type DNSRecordChangedEvent = {
  node: string
  name: string
  resource: string
  record: string
}
export type DNSRecordDeletedEvent = {
  node: string
  name: string
  resource: string
}
export type DNSZoneClearedEvent = {
  node: string
}
export type ContenthashChangedEvent = {
  node: string
  hash: string
}
export type AddrChangedEvent = {
  node: string
  a: Address
}
export type AddressChangedEvent = {
  node: string
  coinType: string
  newAddress: string
}
export type ABIChangedEvent = {
  node: string
  contentType: string
}
export interface AuthorisationChangedEventLog extends EventLog<AuthorisationChangedEvent, 'AuthorisationChanged'> {}
export interface TextChangedEventLog extends EventLog<TextChangedEvent, 'TextChanged'> {}
export interface PubkeyChangedEventLog extends EventLog<PubkeyChangedEvent, 'PubkeyChanged'> {}
export interface NameChangedEventLog extends EventLog<NameChangedEvent, 'NameChanged'> {}
export interface InterfaceChangedEventLog extends EventLog<InterfaceChangedEvent, 'InterfaceChanged'> {}
export interface DNSRecordChangedEventLog extends EventLog<DNSRecordChangedEvent, 'DNSRecordChanged'> {}
export interface DNSRecordDeletedEventLog extends EventLog<DNSRecordDeletedEvent, 'DNSRecordDeleted'> {}
export interface DNSZoneClearedEventLog extends EventLog<DNSZoneClearedEvent, 'DNSZoneCleared'> {}
export interface ContenthashChangedEventLog extends EventLog<ContenthashChangedEvent, 'ContenthashChanged'> {}
export interface AddrChangedEventLog extends EventLog<AddrChangedEvent, 'AddrChanged'> {}
export interface AddressChangedEventLog extends EventLog<AddressChangedEvent, 'AddressChanged'> {}
export interface ABIChangedEventLog extends EventLog<ABIChangedEvent, 'ABIChanged'> {}
interface ENSResolverEvents {
  AuthorisationChanged: EventSubscriptionFactory<AuthorisationChangedEventLog>
  TextChanged: EventSubscriptionFactory<TextChangedEventLog>
  PubkeyChanged: EventSubscriptionFactory<PubkeyChangedEventLog>
  NameChanged: EventSubscriptionFactory<NameChangedEventLog>
  InterfaceChanged: EventSubscriptionFactory<InterfaceChangedEventLog>
  DNSRecordChanged: EventSubscriptionFactory<DNSRecordChangedEventLog>
  DNSRecordDeleted: EventSubscriptionFactory<DNSRecordDeletedEventLog>
  DNSZoneCleared: EventSubscriptionFactory<DNSZoneClearedEventLog>
  ContenthashChanged: EventSubscriptionFactory<ContenthashChangedEventLog>
  AddrChanged: EventSubscriptionFactory<AddrChangedEventLog>
  AddressChanged: EventSubscriptionFactory<AddressChangedEventLog>
  ABIChanged: EventSubscriptionFactory<ABIChangedEventLog>
}
interface ENSResolverEventLogs {
  AuthorisationChanged: AuthorisationChangedEventLog
  TextChanged: TextChangedEventLog
  PubkeyChanged: PubkeyChangedEventLog
  NameChanged: NameChangedEventLog
  InterfaceChanged: InterfaceChangedEventLog
  DNSRecordChanged: DNSRecordChangedEventLog
  DNSRecordDeleted: DNSRecordDeletedEventLog
  DNSZoneCleared: DNSZoneClearedEventLog
  ContenthashChanged: ContenthashChangedEventLog
  AddrChanged: AddrChangedEventLog
  AddressChanged: AddressChangedEventLog
  ABIChanged: ABIChangedEventLog
}
interface ENSResolverTxEventLogs {
  AuthorisationChanged: AuthorisationChangedEventLog[]
  TextChanged: TextChangedEventLog[]
  PubkeyChanged: PubkeyChangedEventLog[]
  NameChanged: NameChangedEventLog[]
  InterfaceChanged: InterfaceChangedEventLog[]
  DNSRecordChanged: DNSRecordChangedEventLog[]
  DNSRecordDeleted: DNSRecordDeletedEventLog[]
  DNSZoneCleared: DNSZoneClearedEventLog[]
  ContenthashChanged: ContenthashChangedEventLog[]
  AddrChanged: AddrChangedEventLog[]
  AddressChanged: AddressChangedEventLog[]
  ABIChanged: ABIChangedEventLog[]
}
export interface ENSResolverTransactionReceipt extends TransactionReceipt<ENSResolverTxEventLogs> {}
interface ENSResolverMethods {
  supportsInterface(interfaceID: string): TxCall<boolean>
  setDNSRecords(node: string, data: string): TxSend<ENSResolverTransactionReceipt>
  setText(node: string, key: string, value: string): TxSend<ENSResolverTransactionReceipt>
  interfaceImplementer(node: string, interfaceID: string): TxCall<Address>
  ABI(
    node: string,
    contentTypes: number | string | BN
  ): TxCall<{
    0: string
    1: string
  }>
  setPubkey(node: string, x: string, y: string): TxSend<ENSResolverTransactionReceipt>
  setContenthash(node: string, hash: string): TxSend<ENSResolverTransactionReceipt>
  addr(node: string): TxCall<Address>
  setAuthorisation(node: string, target: Address, isAuthorised: boolean): TxSend<ENSResolverTransactionReceipt>
  hasDNSRecords(node: string, name: string): TxCall<boolean>
  text(node: string, key: string): TxCall<string>
  setABI(node: string, contentType: number | string | BN, data: string): TxSend<ENSResolverTransactionReceipt>
  name(node: string): TxCall<string>
  setName(node: string, name: string): TxSend<ENSResolverTransactionReceipt>
  setAddr(node: string, coinType: number | string | BN, a: string): TxSend<ENSResolverTransactionReceipt>
  dnsRecord(node: string, name: string, resource: number | string | BN): TxCall<string>
  clearDNSZone(node: string): TxSend<ENSResolverTransactionReceipt>
  contenthash(node: string): TxCall<string>
  pubkey(
    node: string
  ): TxCall<{
    x: string
    0: string
    y: string
    1: string
  }>
  setAddr(node: string, a: Address): TxSend<ENSResolverTransactionReceipt>
  setInterface(node: string, interfaceID: string, implementer: Address): TxSend<ENSResolverTransactionReceipt>
  addr(node: string, coinType: number | string | BN): TxCall<string>
  authorisations(a0: string, a1: Address, a2: Address): TxCall<boolean>
}
export interface ENSResolverDefinition {
  methods: ENSResolverMethods
  events: ENSResolverEvents
  eventLogs: ENSResolverEventLogs
}
export class ENSResolver extends Contract<ENSResolverDefinition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
}
export let ENSResolverAbi = abi
