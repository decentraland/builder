import * as React from 'react'

import { getBackgroundStyle, getThumbnailURL } from 'modules/item/utils'
import ItemBadge from 'components/ItemBadge'
import { SmartBadge } from 'components/SmartBadge'
import { ItemMetadataType } from 'modules/item/types'
import { getItemMetadataType } from 'modules/item/utils'
import { Props } from './ItemImage.types'
import './ItemImage.css'

export default class ItemImage extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    hasBadge: false
  }

  render() {
    const { className, item, src, hasBadge, badgeSize } = this.props
    const isSmart = getItemMetadataType(item) === ItemMetadataType.SMART_WEARABLE

    return (
      <div className={`ItemImage is-image image-wrapper ${className}`} style={getBackgroundStyle(item.rarity)}>
        <img className="item-image" src={src || getThumbnailURL(item)} alt={item.name} />
        {hasBadge ? (
          <>
            <ItemBadge item={item} size={badgeSize}></ItemBadge>
            {isSmart ? <SmartBadge size={badgeSize} /> : null}
          </>
        ) : null}
      </div>
    )
  }
}
