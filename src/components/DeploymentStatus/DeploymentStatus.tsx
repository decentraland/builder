import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  componentDidMount() {
    const { projectId, onQueryRemoteCID } = this.props
    onQueryRemoteCID(projectId)
  }

  render() {
    const { deployment, status, className = '' } = this.props
    const { x, y } = deployment ? deployment.placement.point : { x: 0, y: 0 }
    let classes = `DeploymentStatus ${className}`

    if (status === Status.PUBLISHED) {
      classes += ' published'
    } else if (status === Status.NEEDS_SYNC) {
      classes += ' dirty'
    } else {
      classes += ' unpublished'
    }

    return (
      <Popup
        className="status"
        position="bottom left"
        content={
          <span>
            {t('deployment_modal.land.confirmation.location_label')} {`${x},${y}`}
          </span>
        }
        trigger={<span className={classes} />}
        on="hover"
        inverted
      />
    )
  }
}
