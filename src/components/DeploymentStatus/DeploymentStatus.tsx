import * as React from 'react'
import classNames from 'classnames'
import { Badge } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DeploymentStatus as Status } from 'modules/deployment/types'
import { Props } from './DeploymentStatus.types'
import './DeploymentStatus.css'

export default class DeploymentStatus extends React.PureComponent<Props> {
  render() {
    const { status, className = '', type } = this.props
    const classes = classNames('DeploymentStatus', 'status-badge', className)
    if (status === Status.PUBLISHED || (type === 'pool' && status === Status.NEEDS_SYNC)) {
      return (
        <Badge className={classes} color="#34CE76">
          {t('scene_detail_page.published')}
        </Badge>
      )
    } else if (status === Status.NEEDS_SYNC) {
      return (
        <Badge className={classes} color="#FFBC5B">
          {t('scene_detail_page.unsynced')}
        </Badge>
      )
    } else {
      return (
        <Badge className={classes} color="#FFBC5B">
          {t('scene_detail_page.draft')}
        </Badge>
      )
    }
  }
}
