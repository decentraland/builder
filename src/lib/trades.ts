import { ethers } from 'ethers'
import type { TypedDataDomain } from '@ethersproject/abstract-signer'
import { TradeAssetType, TradeCreation } from '@dcl/schemas'
import { ContractName, getContract } from 'decentraland-transactions'
import { getSigner } from 'decentraland-dapps/dist/lib'
import { fromMillisecondsToSeconds } from 'decentraland-dapps/dist/lib/time'

/**
 * Vendored from decentraland-dapps@29.3.1-20260805170817.commit-f4ffa6a `lib/trades` because its `getValueForTradeAsset` has no case for
 * `TradeAssetType.USD_PEGGED_MANA` and returns '' — which signs successfully but produces an invalid
 * EIP-712 payload the marketplace rejects. For ERC20 trades the output here is byte-identical to the
 * dapps implementation (pinned by trades.spec.ts). Delete this file once dapps supports USD-pegged
 * assets.
 */

export const OFFCHAIN_MARKETPLACE_TYPES = {
  Trade: [
    { name: 'checks', type: 'Checks' },
    { name: 'sent', type: 'AssetWithoutBeneficiary[]' },
    { name: 'received', type: 'Asset[]' }
  ],
  Asset: [
    { name: 'assetType', type: 'uint256' },
    { name: 'contractAddress', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'extra', type: 'bytes' },
    { name: 'beneficiary', type: 'address' }
  ],
  AssetWithoutBeneficiary: [
    { name: 'assetType', type: 'uint256' },
    { name: 'contractAddress', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'extra', type: 'bytes' }
  ],
  Checks: [
    { name: 'uses', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'effective', type: 'uint256' },
    { name: 'salt', type: 'bytes32' },
    { name: 'contractSignatureIndex', type: 'uint256' },
    { name: 'signerSignatureIndex', type: 'uint256' },
    { name: 'allowedRoot', type: 'bytes32' },
    { name: 'externalChecks', type: 'ExternalCheck[]' }
  ],
  ExternalCheck: [
    { name: 'contractAddress', type: 'address' },
    { name: 'selector', type: 'bytes4' },
    { name: 'value', type: 'bytes' },
    { name: 'required', type: 'bool' }
  ]
}

export function valueForAsset(asset: { assetType: TradeAssetType; tokenId?: string; itemId?: string; amount?: string }): string {
  switch (asset.assetType) {
    case TradeAssetType.ERC721:
      if (!asset.tokenId) throw new Error('Missing tokenId for ERC721 asset')
      return asset.tokenId
    case TradeAssetType.COLLECTION_ITEM:
      if (!asset.itemId) throw new Error('Missing itemId for COLLECTION_ITEM asset')
      return asset.itemId
    case TradeAssetType.ERC20:
    case TradeAssetType.USD_PEGGED_MANA:
      if (!asset.amount) throw new Error('Missing amount for ERC20/USD_PEGGED_MANA asset')
      return asset.amount
    default:
      // An unknown asset must never reach the signer: '' signs fine but the signature is garbage.
      throw new Error(`Unsupported assetType ${String(asset.assetType)}`)
  }
}

export function generateTradeValues(trade: Omit<TradeCreation, 'signature'>) {
  return {
    checks: {
      uses: trade.checks.uses,
      expiration: fromMillisecondsToSeconds(trade.checks.expiration),
      effective: fromMillisecondsToSeconds(trade.checks.effective),
      salt: ethers.utils.hexZeroPad(trade.checks.salt, 32),
      contractSignatureIndex: trade.checks.contractSignatureIndex,
      signerSignatureIndex: trade.checks.signerSignatureIndex,
      allowedRoot: ethers.utils.hexZeroPad(trade.checks.allowedRoot || '0x', 32),
      externalChecks: (trade.checks.externalChecks ?? []).map(externalCheck => ({
        contractAddress: externalCheck.contractAddress,
        selector: externalCheck.selector,
        value: externalCheck.value ? externalCheck.value : '0x',
        required: externalCheck.required
      }))
    },
    sent: trade.sent.map(asset => ({
      assetType: asset.assetType,
      contractAddress: asset.contractAddress,
      value: valueForAsset(asset),
      extra: asset.extra ? asset.extra : '0x'
    })),
    received: trade.received.map(asset => ({
      assetType: asset.assetType,
      contractAddress: asset.contractAddress,
      value: valueForAsset(asset),
      extra: asset.extra ? asset.extra : '0x',
      beneficiary: asset.beneficiary
    }))
  }
}

export async function getTradeSignature(trade: Omit<TradeCreation, 'signature'>): Promise<string> {
  const marketplaceContract = getContract(ContractName.OffChainMarketplaceV2, trade.chainId)
  if (!marketplaceContract) {
    throw new Error(`The ${ContractName.OffChainMarketplaceV2} contract doesn't exist on chain ${trade.chainId}`)
  }

  const signer = (await getSigner()) as ethers.providers.JsonRpcSigner
  const domain: TypedDataDomain = {
    name: marketplaceContract.name,
    version: marketplaceContract.version,
    salt: ethers.utils.hexZeroPad(ethers.utils.hexlify(trade.chainId), 32),
    verifyingContract: marketplaceContract.address
  }

  return signer._signTypedData(domain, OFFCHAIN_MARKETPLACE_TYPES, generateTradeValues(trade))
}
