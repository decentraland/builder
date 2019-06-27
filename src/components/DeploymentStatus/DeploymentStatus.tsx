import * as React from 'react'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  render() {
    const { status } = this.props
    let classes = 'DeploymentStatus'

    if (status === Status.PUBLISHED) {
      classes += ' published'
    } else if (status === Status.NEEDS_SYNC) {
      classes += ' dirty'
    } else {
      classes += ' unpublished'
    }

    return <div className={classes} />
  }
}
