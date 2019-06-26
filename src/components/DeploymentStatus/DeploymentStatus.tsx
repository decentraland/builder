import * as React from 'react'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  render() {
    const { status } = this.props
    let classes = 'DeploymentStatus'

    if (status === Status.UNPUBLISHED) classes += ' unpublished'
    if (status === Status.PUBLISHED) classes += ' published'
    if (status === Status.NEEDS_SYNC) classes += ' sync'

    return <div className={classes} />
  }
}
