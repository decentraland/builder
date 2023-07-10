import * as React from 'react'
import classNames from 'classnames'
import { Layer, Dropdown, Button, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { isDevelopment } from 'lib/environment'
import { idToCoords, coordsToId, hoverStrokeByRole, hoverFillByRole } from 'modules/land/utils'
import { locations } from 'routing/locations'
import { getStatus } from 'modules/deployment/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import { RoleType } from 'modules/land/types'
import { Atlas } from 'components/Atlas'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import SceneStats from 'components/SceneStats'
import { DeployModalView, DeployModalMetadata } from 'components/Modals/DeployModal/DeployModal.types'
import Stats from 'components/SceneStats/Stats/Stats'
import { Props } from './DeploymentDetail.types'
import './DeploymentDetail.css'

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const WORLDS_CONTENT_SERVER_URL = config.get('WORLDS_CONTENT_SERVER', '')

export default class DeploymentDetail extends React.PureComponent<Props> {
  getHighlightLayer =
    (color: Record<RoleType, string>, scale: number): Layer =>
    (x, y) => {
      const { deployment, landTiles } = this.props
      const id = coordsToId(x, y)
      const tile = landTiles[id]
      if (!tile) return null
      return deployment.parcels.some(parcel => parcel === id) ? { color: color[tile.land.role], scale } : null
    }

  renderThumbnail = () => {
    const { deployment, landTiles, project } = this.props
    const [x, y] = idToCoords(deployment.base)
    const landId = deployment.base in landTiles ? landTiles[deployment.base].land.id : null

    if (landId) {
      return (
        <div className="atlas-wrapper">
          <Atlas
            x={x}
            y={y}
            isDraggable={false}
            zoom={0.75}
            layers={[this.getHighlightLayer(hoverStrokeByRole, 1.4), this.getHighlightLayer(hoverFillByRole, 1.2)]}
          />
        </div>
      )
    }

    return (
      <div className="thumbnail-wrapper">
        <img className="thumbnail" src={project.thumbnail} alt={project.description} />
      </div>
    )
  }

  getExplorerUrl = (world: string) => {
    if (isDevelopment) {
      return `${EXPLORER_URL}/?realm=${WORLDS_CONTENT_SERVER_URL}/world/${world}&NETWORK=${config.get("NETWORK")}`
    }
    return `${EXPLORER_URL}/world/${world}`
  }

  render() {
    const { project, deployment, landTiles, onNavigate, onOpenModal } = this.props
    const landId = deployment.base in landTiles ? landTiles[deployment.base].land.id : null
    const locationText = deployment.world ? deployment.world : deployment.base
    const status = getStatus(project, deployment)
    let statusText = t('scene_detail_page.published')
    if (status === DeploymentStatus.NEEDS_SYNC) {
      statusText = t('scene_detail_page.unsynced')
    }

    return (
      <div
        className={classNames('DeploymentDetail', { clickable: landId })}
        onClick={() => landId && onNavigate(locations.landDetail(landId))}
      >
        {this.renderThumbnail()}
        <Stats label={t('scene_detail_page.status')}>{statusText}</Stats>
        <Stats label={t('scene_detail_page.location')}>
          <div className={classNames({ 'world-url': deployment.world })}>
            {locationText}
            {deployment.world ? (
              <>
                <CopyToClipboard role="button" text={this.getExplorerUrl(deployment.world)} showPopup={true}>
                  <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                </CopyToClipboard>
                <a href={this.getExplorerUrl(deployment.world)} target="_blank" rel="noopener noreferrer">
                  <Icon name="external alternate" />
                </a>
              </>
            ) : null}
          </div>
        </Stats>
        <SceneStats deployment={deployment} />
        <Dropdown
          trigger={
            <Button basic>
              <Icon name="ellipsis horizontal" />
            </Button>
          }
          inline
          direction="left"
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text={t('scene_detail_page.actions.unpublish')}
              onClick={() =>
                onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, deploymentId: deployment.id } as DeployModalMetadata)
              }
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}
