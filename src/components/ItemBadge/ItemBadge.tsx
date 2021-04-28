import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { getBodyShapeType } from 'modules/item/utils'
import { Props } from './ItemBadge.types'
import './ItemBadge.css'

export default class ItemBadge extends React.PureComponent<Props> {
  render() {
    const { item, size } = this.props
    const bodyShape = getBodyShapeType(item)
    return <div title={t(`body_shapes.${bodyShape}`)} className={`ItemBadge ${bodyShape} ${size || 'normal'}`} />
  }
}
