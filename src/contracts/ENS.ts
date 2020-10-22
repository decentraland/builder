import BN from "bn.js";
import { Address } from "web3x-es/address";
import { EventLog, TransactionReceipt } from "web3x-es/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x-es/contract";
import { Eth } from "web3x-es/eth";
import abi from "./ENSAbi";
export type TransferEvent = {
    node: string;
    owner: Address;
};
export type NewOwnerEvent = {
    node: string;
    label: string;
    owner: Address;
};
export type NewResolverEvent = {
    node: string;
    resolver: Address;
};
export type NewTTLEvent = {
    node: string;
    ttl: string;
};
export interface TransferEventLog extends EventLog<TransferEvent, "Transfer"> {
}
export interface NewOwnerEventLog extends EventLog<NewOwnerEvent, "NewOwner"> {
}
export interface NewResolverEventLog extends EventLog<NewResolverEvent, "NewResolver"> {
}
export interface NewTTLEventLog extends EventLog<NewTTLEvent, "NewTTL"> {
}
interface ENSEvents {
    Transfer: EventSubscriptionFactory<TransferEventLog>;
    NewOwner: EventSubscriptionFactory<NewOwnerEventLog>;
    NewResolver: EventSubscriptionFactory<NewResolverEventLog>;
    NewTTL: EventSubscriptionFactory<NewTTLEventLog>;
}
interface ENSEventLogs {
    Transfer: TransferEventLog;
    NewOwner: NewOwnerEventLog;
    NewResolver: NewResolverEventLog;
    NewTTL: NewTTLEventLog;
}
interface ENSTxEventLogs {
    Transfer: TransferEventLog[];
    NewOwner: NewOwnerEventLog[];
    NewResolver: NewResolverEventLog[];
    NewTTL: NewTTLEventLog[];
}
export interface ENSTransactionReceipt extends TransactionReceipt<ENSTxEventLogs> {
}
interface ENSMethods {
    resolver(node: string): TxCall<Address>;
    owner(node: string): TxCall<Address>;
    setSubnodeOwner(node: string, label: string, owner: Address): TxSend<ENSTransactionReceipt>;
    setTTL(node: string, ttl: number | string | BN): TxSend<ENSTransactionReceipt>;
    ttl(node: string): TxCall<string>;
    setResolver(node: string, resolver: Address): TxSend<ENSTransactionReceipt>;
    setOwner(node: string, owner: Address): TxSend<ENSTransactionReceipt>;
}
export interface ENSDefinition {
    methods: ENSMethods;
    events: ENSEvents;
    eventLogs: ENSEventLogs;
}
export class ENS extends Contract<ENSDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var ENSAbi = abi;
