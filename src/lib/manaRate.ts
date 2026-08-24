import { Network } from '@dcl/schemas'
import { ethers } from 'ethers'
import { getChainIdByNetwork, getNetworkProvider } from 'decentraland-dapps/dist/lib/eth'
import { getOffChainMarketplaceContract } from 'decentraland-dapps/dist/lib/trades'

/** Max age of the oracle round before it's treated as stale (aggregator heartbeat ~24h + buffer). */
const MAX_STALENESS_SECONDS = 90000

/**
 * Current MANA price in USD wei per whole MANA (1e18 = $1), read from the same MANA/USD aggregator
 * `OffChainMarketplaceV2` uses to settle USD-pegged trades — so the hint matches what a sale will
 * actually convert at. Throws on an unreachable, incomplete, or stale round so callers can hide the
 * hint instead of showing a bad rate.
 */
export async function fetchManaToUsdRate(): Promise<ethers.BigNumber> {
  const chainId = getChainIdByNetwork(Network.MATIC)
  const marketplace = await getOffChainMarketplaceContract(chainId)
  const aggregatorAddress = (await marketplace.manaUsdAggregator()) as string

  const networkProvider = await getNetworkProvider(chainId)
  const provider = new ethers.providers.Web3Provider(networkProvider)
  const aggregator = new ethers.Contract(
    aggregatorAddress,
    ['function decimals() view returns (uint8)', 'function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)'],
    provider
  )

  const [decimals, roundData] = await Promise.all([
    aggregator.decimals() as Promise<number>,
    aggregator.latestRoundData() as Promise<[ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber]>
  ])
  const [roundId, answer, , updatedAt, answeredInRound] = roundData

  if (answer.lte(0)) {
    throw new Error('MANA rate unavailable')
  }
  // An answer carried over from an earlier round is not fresh data for this round.
  if (answeredInRound.lt(roundId)) {
    throw new Error('MANA rate incomplete')
  }
  const ageSeconds = Math.floor(Date.now() / 1000) - updatedAt.toNumber()
  if (updatedAt.lte(0) || ageSeconds > MAX_STALENESS_SECONDS) {
    throw new Error('MANA rate stale')
  }

  if (Number(decimals) > 18) {
    throw new Error(`Unexpected oracle decimals: ${String(decimals)}`)
  }
  return answer.mul(ethers.BigNumber.from(10).pow(18 - Number(decimals)))
}

/**
 * USD value of a user-typed MANA amount (a decimal string) at the given rate, formatted with two
 * decimals. Returns null when the amount isn't parseable, so callers can hide the hint.
 */
export function manaToUsd(manaAmount: string, rate: ethers.BigNumber): string | null {
  let manaWei: ethers.BigNumber
  try {
    manaWei = ethers.utils.parseEther(manaAmount)
  } catch {
    return null
  }
  const usdWei = manaWei.mul(rate).div(ethers.constants.WeiPerEther)
  return Number(ethers.utils.formatEther(usdWei)).toFixed(2)
}
