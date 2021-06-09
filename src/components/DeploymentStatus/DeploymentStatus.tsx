import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { getDeployment, getStatus } from 'modules/deployment/utils'
import { coordsToId, getExplorerURL } from 'modules/land/utils'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  render() {
    const { project, deployments, status, className = '', type } = this.props
    const deployment = getDeployment(project, deployments)
    const { x, y } = deployment ? deployment.placement.point : { x: 0, y: 0 }
    let classes = `DeploymentStatus ${className}`
    const multiple = deployments.length > 1
    let tooltip = ''
    if (status === Status.PUBLISHED || (type === 'pool' && status === Status.NEEDS_SYNC)) {
      classes += ' published'
      if (!multiple) {
        tooltip = t('deployment_status.online', { coords: coordsToId(x, y) })
      } else {
        tooltip = t('deployment_status.online_multiple', { count: deployments.length })
      }
    } else if (status === Status.NEEDS_SYNC) {
      classes += ' dirty'
      if (!multiple) {
        tooltip = t('deployment_status.needs_sync', { coords: coordsToId(x, y) })
      } else {
        tooltip = t('deployment_status.needs_sync_multiple', {
          count: deployments.filter(deployment => getStatus(project, deployment) === Status.NEEDS_SYNC).length
        })
      }
    } else {
      classes += ' unpublished'
    }

    return (
      <Popup
        position="bottom left"
        content={tooltip}
        trigger={<a className={classes} href={getExplorerURL(x, y)} target="_blank" rel="no:opener no:referrer" />}
        on="hover"
        inverted
      />
    )
  }
}
