import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Popup } from 'decentraland-ui'

import { SyncStatus } from 'modules/item/types'
import { Props } from './CollectionStatus.types'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'
import './CollectionStatus.css'

export default class CollectionStatus extends React.PureComponent<Props> {
  render() {
    const { status, collection } = this.props
    const shouldRenderStatus = status && status !== SyncStatus.UNPUBLISHED && getCollectionType(collection) !== CollectionType.THIRD_PARTY
    return shouldRenderStatus ? (
      <Popup
        position="top center"
        content={t(`status.${status}`)}
        trigger={<div className={`CollectionStatus ${status}`} title={t(`status.${status}`)} />}
        hideOnScroll={true}
        on="hover"
      />
    ) : null
  }
}
