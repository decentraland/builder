import { WorldsWalletStats } from 'lib/api/worlds'
import { ENS } from 'modules/ens/types'
import { Deployment } from 'modules/deployment/types'
import { isDevelopment } from 'lib/environment'
import { config } from 'config'

export const fromBytesToMegabytes = (bytes: number) => {
  return bytes / 1024 / 1024
}

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const WORLDS_CONTENT_SERVER_URL = config.get('WORLDS_CONTENT_SERVER', '')

export const BLOCK_DELAY_IN_MILLISECONDS = 48 * 60 * 60 * 1000 // 48 hours

export enum DCLWorldsStatus {
  OK = 'ok',
  BLOCKED = 'blocked',
  TO_BE_BLOCKED = 'to-be-blocked'
}

export type GetDCLWorldsStatusResult =
  | {
      status: DCLWorldsStatus.OK
    }
  | {
      status: DCLWorldsStatus.TO_BE_BLOCKED
      toBeBlockedAt: Date
    }
  | {
      status: DCLWorldsStatus.BLOCKED
      blockedAt: Date
    }

export const getDCLWorldsStatus = (stats: WorldsWalletStats): GetDCLWorldsStatusResult => {
  const now = new Date().getTime()
  const blockedSince = stats.blockedSince ? new Date(stats.blockedSince).getTime() : null

  if (stats.usedSpace <= stats.maxAllowedSpace || !blockedSince || now < blockedSince) {
    return {
      status: DCLWorldsStatus.OK
    }
  }

  const blockedAt = new Date(blockedSince + BLOCK_DELAY_IN_MILLISECONDS)

  if (now - blockedSince > BLOCK_DELAY_IN_MILLISECONDS) {
    return {
      status: DCLWorldsStatus.BLOCKED,
      blockedAt: blockedAt
    }
  }

  return {
    status: DCLWorldsStatus.TO_BE_BLOCKED,
    toBeBlockedAt: blockedAt
  }
}

export const isWorldDeployed = (deploymentsByWorlds: Record<string, Deployment>, ens: ENS) => {
  if (ens.worldStatus?.healthy) {
    return !!deploymentsByWorlds[ens.subdomain]
  }
  return false
}

export const getExplorerUrl = (world: string) => {
  if (isDevelopment) {
    return `${EXPLORER_URL}/?realm=${WORLDS_CONTENT_SERVER_URL}/world/${world}&NETWORK=sepolia`
  }
  return `${EXPLORER_URL}/world/${world}`
}
