import { WorldsWalletStats } from 'lib/api/worlds'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { Button, Icon as DCLIcon, Popup } from 'decentraland-ui'
import { ENS } from 'modules/ens/types'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { Deployment } from 'modules/deployment/types'
import { isDevelopment } from 'lib/environment'
import { config } from 'config'
import { Project } from 'modules/project/types'

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

export const renderWorldUrl = (deploymentsByWorlds: Record<string, Deployment>, ens: ENS) => {
  const url = getExplorerUrl(ens.subdomain)
  return isWorldDeployed(deploymentsByWorlds, ens) ? (
    <div className="world-url">
      <span>{url}</span>
      <div className="right">
        <CopyToClipboard role="button" text={url} showPopup={true}>
          <DCLIcon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
        </CopyToClipboard>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <DCLIcon name="external alternate" />
        </a>
      </div>
    </div>
  ) : (
    <span className="empty-url">{t('worlds_list_page.table.empty_url')}</span>
  )
}

export const renderPublishSceneButton = ({
  deploymentsByWorlds,
  ens,
  projects,
  onEditScene,
  onUnpublishScene,
  onPublishScene
}: {
  deploymentsByWorlds: Record<string, Deployment>
  ens: ENS
  projects: Project[]
  onEditScene?: (ens: ENS) => void
  onUnpublishScene?: (ens: ENS) => void
  onPublishScene?: () => void
}) => {
  const deployment = deploymentsByWorlds[ens.subdomain]
  return isWorldDeployed(deploymentsByWorlds, ens) ? (
    <div className="publish-scene">
      <Popup content={deployment?.name} on="hover" trigger={<span>{deployment?.name}</span>} />
      {projects.find(project => project.id === deployment?.projectId)
        ? onEditScene && (
            <Button inverted size="small" onClick={() => onEditScene(ens)}>
              {t('worlds_list_page.table.edit_scene')}
            </Button>
          )
        : onUnpublishScene && (
            <Popup
              content={t('worlds_list_page.table.scene_published_outside_builder')}
              on="hover"
              position="top center"
              trigger={
                <Button inverted size="small" onClick={() => onUnpublishScene(ens)}>
                  {t('worlds_list_page.table.unpublish_scene')}
                </Button>
              }
            />
          )}
    </div>
  ) : (
    <div className="publish-scene">
      <span>-</span>
      {onPublishScene && (
        <Button primary size="small" onClick={onPublishScene}>
          {t('worlds_list_page.table.publish_scene')}
        </Button>
      )}
    </div>
  )
}
