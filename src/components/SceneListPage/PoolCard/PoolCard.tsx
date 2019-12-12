import * as React from 'react'
import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { DeployModalMetadata, DeployModalView } from 'components/Modals/DeployModal/DeployModal.types'
import { locations } from 'routing/locations'
import DeploymentStatus from 'components/DeploymentStatus'
import Icon from 'components/Icon'
import { Props, DefaultProps, State } from './PoolCard.types'
import './PoolCard.css'

export default class PoolCard extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    items: 0
  }

  state = {
    isDeleting: false
  }

  handleOnClick = () => {
    const { onClick, pool } = this.props
    if (onClick) {
      onClick(pool)
    }
  }

  handleConfirmDeleteProject = () => {
    this.setState({ isDeleting: true })
  }

  handleCancelDeleteProject = () => {
    this.setState({ isDeleting: false })
  }

  handleClearDeployment = () => {
    const { pool, onOpenModal } = this.props
    onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, projectId: pool.id } as DeployModalMetadata)
  }

  render() {
    const { pool } = this.props
    const parcels = pool.statistics ? pool.statistics.parcels : pool.layout.cols * pool.layout.rows

    return (
      <Link to={locations.poolView(pool.id, 'pool')} className="PoolCard">
        <div className="thumbnail" style={{ backgroundImage: `url(${pool.thumbnail})` }} />
        <DeploymentStatus projectId={pool.id} className="deployment-status" />
        <div className="project-data">
          <div className="title-wrapper">
            <div className="title">{pool.title}</div>
          </div>
          <div className="description" title={pool.description}>
            <div className="component-list">
              <div className="component">
                <Icon name="scene-parcel" /> {t('public_page.parcel_count', { parcels })}
              </div>
              {pool.statistics && <div className="component">
                <Icon name="scene-object" /> {t('public_page.item_count', { items: pool.statistics.transforms })}
              </div>}
            </div>
          </div>
        </div>
      </Link>
    )
  }
}
