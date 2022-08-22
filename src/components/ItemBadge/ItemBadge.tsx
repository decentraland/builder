import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { getBodyShapeType, toBodyShapeType } from 'modules/item/utils'
import { Props } from './ItemBadge.types'
import './ItemBadge.css'

export default class ItemBadge extends React.PureComponent<Props> {
  render() {
    const { item, bodyShape: bodyShapeProp, size, className } = this.props
    const bodyShape = bodyShapeProp ? toBodyShapeType(bodyShapeProp) : getBodyShapeType(item)
    return (
      <div title={t(`body_shapes.${bodyShape}`)} className={`ItemBadge ${className ? className : ''} ${bodyShape} ${size || 'normal'}`} />
    )
  }
}
