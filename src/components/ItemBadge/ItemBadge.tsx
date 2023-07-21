import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Popup } from 'decentraland-ui'

import { SmartIcon } from 'components/SmartIcon'
import { getBodyShapeType, isSmart, toBodyShapeType } from 'modules/item/utils'
import { Props } from './ItemBadge.types'
import './ItemBadge.css'

export default class ItemBadge extends React.PureComponent<Props> {
  render() {
    const { item, bodyShape: bodyShapeProp, size, className } = this.props
    const bodyShape = bodyShapeProp ? toBodyShapeType(bodyShapeProp) : getBodyShapeType(item)
    const isSmartItem = isSmart(item)

    return isSmartItem ? (
      <Popup
        content={t('item_types.smart_wearable')}
        position="top center"
        trigger={
          <div className={`ItemBadge smart ${className ? className : ''} ${size || 'normal'}`}>
            <SmartIcon />
          </div>
        }
        on="hover"
      />
    ) : (
      <div title={t(`body_shapes.${bodyShape}`)} className={`ItemBadge ${className ? className : ''} ${bodyShape} ${size || 'normal'}`} />
    )
  }
}
