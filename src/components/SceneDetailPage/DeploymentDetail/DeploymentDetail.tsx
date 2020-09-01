import * as React from 'react'
import { Props } from './DeploymentDetail.types'
import './DeploymentDetail.css'
import { Atlas } from 'components/Atlas'
import { idToCoords, coordsToId } from 'modules/land/utils'
import { Layer, Dropdown, Button, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { getStatus } from 'modules/deployment/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import { DeployModalView } from 'components/Modals/DeployModal/DeployModal.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export default class DeploymentDetail extends React.PureComponent<Props> {
  highlightLayer: Layer = (x, y) => {
    const { deployment } = this.props
    const id = coordsToId(x, y)
    return deployment.parcels.some(parcel => parcel === id) ? { color: '#ffffff', scale: 1.1 } : null
  }

  render() {
    const { project, deployment, landTiles, onNavigate, onOpenModal } = this.props
    const [x, y] = idToCoords(deployment.base)
    const landId = deployment.base in landTiles ? landTiles[deployment.base].land.id : null
    const status = getStatus(project, deployment)
    let statusClass = 'online'
    let statusText = t('scene_detail_page.online')
    if (status === DeploymentStatus.NEEDS_SYNC) {
      statusText = t('scene_detail_page.unsynced')
      statusClass = 'needs-sync'
    }
    return (
      <div className={`DeploymentDetail ${landId ? 'clickable' : ''}`} onClick={() => landId && onNavigate(locations.landDetail(landId))}>
        <div className="atlas-wrapper">
          <Atlas x={x} y={y} isDraggable={false} zoom={0.75} layers={[this.highlightLayer]} />
        </div>
        <div className="stat">
          <div className="title">
            <i className={`status ${statusClass}`} />
            {statusText}
          </div>
          <div className="secondary-text">{t('scene_detail_page.status')}</div>
        </div>
        <div className="stat">
          <div className="title">{deployment.base}</div>
          <div className="secondary-text">{t('scene_detail_page.location')}</div>
        </div>
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
              onClick={() => onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, deploymentId: deployment.id })}
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}
