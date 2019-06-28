import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  render() {
    const { status, deployment } = this.props
    const { x, y } = deployment ? deployment.placement.point : { x: 0, y: 0 }
    let classes = 'DeploymentStatus'

    if (status === Status.PUBLISHED) {
      classes += ' published'
    } else if (status === Status.NEEDS_SYNC) {
      classes += ' dirty'
    } else {
      classes += ' unpublished'
    }

    return (
      <Popup
        position="bottom left"
        content={<span>Published at {`${x},${y}`}</span>}
        trigger={
          <span>
            <div className={classes} />
          </span>
        }
        on="hover"
        inverted
      />
    )
  }
}
