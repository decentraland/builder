import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Popup } from 'decentraland-ui'

import { SyncStatus } from 'modules/item/types'
import { Props } from './ItemStatus.types'
import './ItemStatus.css'

export default class ItemStatus extends React.PureComponent<Props> {
  render() {
    const { status } = this.props
    return status && status !== SyncStatus.UNPUBLISHED ? (
      <Popup
        position="top center"
        content={t(`status.${status}`)}
        trigger={<div className={`ItemStatus ${status}`} title={t(`status.${status}`)} />}
        hideOnScroll={true}
        on="hover"
      />
    ) : null
  }
}
