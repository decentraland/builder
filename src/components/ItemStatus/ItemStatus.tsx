import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Popup } from 'decentraland-ui'
import { SyncStatus } from 'modules/item/types'
import { Props } from './ItemStatus.types'

import './ItemStatus.css'

export default class ItemStatus extends React.PureComponent<Props> {
  static defaultProps = {
    className: ''
  }

  render() {
    const { status, className } = this.props
    return status && status !== SyncStatus.UNPUBLISHED ? (
      <Popup
        className="ItemStatus popup"
        position="top center"
        content={t(`status.${status}`)}
        trigger={<div className={`ItemStatus orb ${status} ${className}`} title={t(`status.${status}`)} />}
        hideOnScroll={true}
        on="hover"
      />
    ) : null
  }
}
