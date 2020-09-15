import BN from "bn.js";
import { Address } from "web3x-es/address";
import { EventLog, TransactionReceipt } from "web3x-es/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x-es/contract";
import { Eth } from "web3x-es/eth";
import abi from "./ERC721CollectionV2Abi";
export type AddItemEvent = {
    _itemId: string;
    _item: {
        rarity: string;
        totalSupply: string;
        price: string;
        beneficiary: Address;
        metadata: string;
        contentHash: string;
    };
};
export type ApprovalEvent = {
    owner: Address;
    approved: Address;
    tokenId: string;
};
export type ApprovalForAllEvent = {
    owner: Address;
    operator: Address;
    approved: boolean;
};
export type ApproveEvent = {};
export type BaseURIEvent = {
    _oldBaseURI: string;
    _newBaseURI: string;
};
export type CompleteEvent = {};
export type CreatorshipTransferredEvent = {
    _previousCreator: Address;
    _newCreator: Address;
};
export type IssueEvent = {
    _beneficiary: Address;
    _tokenId: string;
    _itemId: string;
    _issuedId: string;
};
export type OwnershipTransferredEvent = {
    previousOwner: Address;
    newOwner: Address;
};
export type RescueItemEvent = {
    _itemId: string;
    _contentHash: string;
    _metadata: string;
};
export type SetEditableEvent = {
    _previousValue: boolean;
    _newValue: boolean;
};
export type SetGlobalManagerEvent = {
    _manager: Address;
    _value: boolean;
};
export type SetGlobalMinterEvent = {
    _minter: Address;
    _value: boolean;
};
export type SetItemManagerEvent = {
    _itemId: string;
    _manager: Address;
    _value: boolean;
};
export type SetItemMinterEvent = {
    _itemId: string;
    _minter: Address;
    _value: boolean;
};
export type TransferEvent = {
    from: Address;
    to: Address;
    tokenId: string;
};
export type UpdateItemEvent = {
    _itemId: string;
    _price: string;
    _beneficiary: Address;
};
export interface AddItemEventLog extends EventLog<AddItemEvent, "AddItem"> {
}
export interface ApprovalEventLog extends EventLog<ApprovalEvent, "Approval"> {
}
export interface ApprovalForAllEventLog extends EventLog<ApprovalForAllEvent, "ApprovalForAll"> {
}
export interface ApproveEventLog extends EventLog<ApproveEvent, "Approve"> {
}
export interface BaseURIEventLog extends EventLog<BaseURIEvent, "BaseURI"> {
}
export interface CompleteEventLog extends EventLog<CompleteEvent, "Complete"> {
}
export interface CreatorshipTransferredEventLog extends EventLog<CreatorshipTransferredEvent, "CreatorshipTransferred"> {
}
export interface IssueEventLog extends EventLog<IssueEvent, "Issue"> {
}
export interface OwnershipTransferredEventLog extends EventLog<OwnershipTransferredEvent, "OwnershipTransferred"> {
}
export interface RescueItemEventLog extends EventLog<RescueItemEvent, "RescueItem"> {
}
export interface SetEditableEventLog extends EventLog<SetEditableEvent, "SetEditable"> {
}
export interface SetGlobalManagerEventLog extends EventLog<SetGlobalManagerEvent, "SetGlobalManager"> {
}
export interface SetGlobalMinterEventLog extends EventLog<SetGlobalMinterEvent, "SetGlobalMinter"> {
}
export interface SetItemManagerEventLog extends EventLog<SetItemManagerEvent, "SetItemManager"> {
}
export interface SetItemMinterEventLog extends EventLog<SetItemMinterEvent, "SetItemMinter"> {
}
export interface TransferEventLog extends EventLog<TransferEvent, "Transfer"> {
}
export interface UpdateItemEventLog extends EventLog<UpdateItemEvent, "UpdateItem"> {
}
interface ERC721CollectionV2Events {
    AddItem: EventSubscriptionFactory<AddItemEventLog>;
    Approval: EventSubscriptionFactory<ApprovalEventLog>;
    ApprovalForAll: EventSubscriptionFactory<ApprovalForAllEventLog>;
    Approve: EventSubscriptionFactory<ApproveEventLog>;
    BaseURI: EventSubscriptionFactory<BaseURIEventLog>;
    Complete: EventSubscriptionFactory<CompleteEventLog>;
    CreatorshipTransferred: EventSubscriptionFactory<CreatorshipTransferredEventLog>;
    Issue: EventSubscriptionFactory<IssueEventLog>;
    OwnershipTransferred: EventSubscriptionFactory<OwnershipTransferredEventLog>;
    RescueItem: EventSubscriptionFactory<RescueItemEventLog>;
    SetEditable: EventSubscriptionFactory<SetEditableEventLog>;
    SetGlobalManager: EventSubscriptionFactory<SetGlobalManagerEventLog>;
    SetGlobalMinter: EventSubscriptionFactory<SetGlobalMinterEventLog>;
    SetItemManager: EventSubscriptionFactory<SetItemManagerEventLog>;
    SetItemMinter: EventSubscriptionFactory<SetItemMinterEventLog>;
    Transfer: EventSubscriptionFactory<TransferEventLog>;
    UpdateItem: EventSubscriptionFactory<UpdateItemEventLog>;
}
interface ERC721CollectionV2EventLogs {
    AddItem: AddItemEventLog;
    Approval: ApprovalEventLog;
    ApprovalForAll: ApprovalForAllEventLog;
    Approve: ApproveEventLog;
    BaseURI: BaseURIEventLog;
    Complete: CompleteEventLog;
    CreatorshipTransferred: CreatorshipTransferredEventLog;
    Issue: IssueEventLog;
    OwnershipTransferred: OwnershipTransferredEventLog;
    RescueItem: RescueItemEventLog;
    SetEditable: SetEditableEventLog;
    SetGlobalManager: SetGlobalManagerEventLog;
    SetGlobalMinter: SetGlobalMinterEventLog;
    SetItemManager: SetItemManagerEventLog;
    SetItemMinter: SetItemMinterEventLog;
    Transfer: TransferEventLog;
    UpdateItem: UpdateItemEventLog;
}
interface ERC721CollectionV2TxEventLogs {
    AddItem: AddItemEventLog[];
    Approval: ApprovalEventLog[];
    ApprovalForAll: ApprovalForAllEventLog[];
    Approve: ApproveEventLog[];
    BaseURI: BaseURIEventLog[];
    Complete: CompleteEventLog[];
    CreatorshipTransferred: CreatorshipTransferredEventLog[];
    Issue: IssueEventLog[];
    OwnershipTransferred: OwnershipTransferredEventLog[];
    RescueItem: RescueItemEventLog[];
    SetEditable: SetEditableEventLog[];
    SetGlobalManager: SetGlobalManagerEventLog[];
    SetGlobalMinter: SetGlobalMinterEventLog[];
    SetItemManager: SetItemManagerEventLog[];
    SetItemMinter: SetItemMinterEventLog[];
    Transfer: TransferEventLog[];
    UpdateItem: UpdateItemEventLog[];
}
export interface ERC721CollectionV2TransactionReceipt extends TransactionReceipt<ERC721CollectionV2TxEventLogs> {
}
interface ERC721CollectionV2Methods {
    ISSUED_ID_BITS(): TxCall<string>;
    ITEM_ID_BITS(): TxCall<string>;
    MAX_ISSUED_ID(): TxCall<string>;
    MAX_ITEM_ID(): TxCall<string>;
    addItems(_items: {
        rarity: number | string | BN;
        totalSupply: number | string | BN;
        price: number | string | BN;
        beneficiary: Address;
        metadata: string;
        contentHash: string;
    }[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    approve(to: Address, tokenId: number | string | BN): TxSend<ERC721CollectionV2TransactionReceipt>;
    approveCollection(): TxSend<ERC721CollectionV2TransactionReceipt>;
    balanceOf(owner: Address): TxCall<string>;
    baseURI(): TxCall<string>;
    batchTransferFrom(_from: Address, _to: Address, _tokenIds: (number | string | BN)[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    completeCollection(): TxSend<ERC721CollectionV2TransactionReceipt>;
    creator(): TxCall<Address>;
    decodeTokenId(_id: number | string | BN): TxCall<{
        "itemId": string;
        0: string;
        "issuedId": string;
        1: string;
    }>;
    editItems(_itemIds: (number | string | BN)[], _prices: (number | string | BN)[], _beneficiaries: Address[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    encodeTokenId(_itemId: number | string | BN, _issuedId: number | string | BN): TxCall<string>;
    getApproved(tokenId: number | string | BN): TxCall<Address>;
    getRarityName(_rarity: number | string | BN): TxCall<string>;
    getRarityValue(_rarity: number | string | BN): TxCall<string>;
    globalManagers(a0: Address): TxCall<boolean>;
    globalMinters(a0: Address): TxCall<boolean>;
    initialize(_name: string, _symbol: string, _creator: Address, _shouldComplete: boolean, _baseURI: string, _items: {
        rarity: number | string | BN;
        totalSupply: number | string | BN;
        price: number | string | BN;
        beneficiary: Address;
        metadata: string;
        contentHash: string;
    }[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    isApproved(): TxCall<boolean>;
    isApprovedForAll(owner: Address, operator: Address): TxCall<boolean>;
    isCompleted(): TxCall<boolean>;
    isEditable(): TxCall<boolean>;
    isInitialized(): TxCall<boolean>;
    issueToken(_beneficiary: Address, _itemId: number | string | BN): TxSend<ERC721CollectionV2TransactionReceipt>;
    issueTokens(_beneficiaries: Address[], _itemIds: (number | string | BN)[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    itemManagers(a0: number | string | BN, a1: Address): TxCall<boolean>;
    itemMinters(a0: number | string | BN, a1: Address): TxCall<boolean>;
    items(a0: number | string | BN): TxCall<{
        "rarity": string;
        0: string;
        "totalSupply": string;
        1: string;
        "price": string;
        2: string;
        "beneficiary": Address;
        3: Address;
        "metadata": string;
        4: string;
        "contentHash": string;
        5: string;
    }>;
    itemsCount(): TxCall<string>;
    name(): TxCall<string>;
    owner(): TxCall<Address>;
    ownerOf(tokenId: number | string | BN): TxCall<Address>;
    renounceOwnership(): TxSend<ERC721CollectionV2TransactionReceipt>;
    rescueItems(_itemIds: (number | string | BN)[], _contentHashes: string[], _metadatas: string[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    safeBatchTransferFrom(_from: Address, _to: Address, _tokenIds: (number | string | BN)[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    safeBatchTransferFrom(_from: Address, _to: Address, _tokenIds: (number | string | BN)[], _data: string): TxSend<ERC721CollectionV2TransactionReceipt>;
    safeTransferFrom(from: Address, to: Address, tokenId: number | string | BN): TxSend<ERC721CollectionV2TransactionReceipt>;
    safeTransferFrom(from: Address, to: Address, tokenId: number | string | BN, _data: string): TxSend<ERC721CollectionV2TransactionReceipt>;
    setApprovalForAll(operator: Address, approved: boolean): TxSend<ERC721CollectionV2TransactionReceipt>;
    setBaseURI(_baseURI: string): TxSend<ERC721CollectionV2TransactionReceipt>;
    setEditable(_value: boolean): TxSend<ERC721CollectionV2TransactionReceipt>;
    setItemsManagers(_itemIds: (number | string | BN)[], _managers: Address[], _values: boolean[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    setItemsMinters(_itemIds: (number | string | BN)[], _minters: Address[], _values: boolean[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    setManagers(_managers: Address[], _values: boolean[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    setMinters(_minters: Address[], _values: boolean[]): TxSend<ERC721CollectionV2TransactionReceipt>;
    supportsInterface(interfaceId: string): TxCall<boolean>;
    symbol(): TxCall<string>;
    tokenByIndex(index: number | string | BN): TxCall<string>;
    tokenOfOwnerByIndex(owner: Address, index: number | string | BN): TxCall<string>;
    tokenURI(_tokenId: number | string | BN): TxCall<string>;
    totalSupply(): TxCall<string>;
    transferCreatorship(_newCreator: Address): TxSend<ERC721CollectionV2TransactionReceipt>;
    transferFrom(from: Address, to: Address, tokenId: number | string | BN): TxSend<ERC721CollectionV2TransactionReceipt>;
    transferOwnership(newOwner: Address): TxSend<ERC721CollectionV2TransactionReceipt>;
}
export interface ERC721CollectionV2Definition {
    methods: ERC721CollectionV2Methods;
    events: ERC721CollectionV2Events;
    eventLogs: ERC721CollectionV2EventLogs;
}
export class ERC721CollectionV2 extends Contract<ERC721CollectionV2Definition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var ERC721CollectionV2Abi = abi;
