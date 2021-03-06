import * as React from 'react'

import { getBackgroundStyle, getThumbnailURL } from 'modules/item/utils'
import ItemBadge from 'components/ItemBadge'
import { Props } from './ItemImage.types'
import './ItemImage.css'

export default class ItemImage extends React.PureComponent<Props> {
  static defaultProps = {
    hasBadge: false
  }

  render() {
    const { item, src, hasBadge, badgeSize } = this.props

    return (
      <div className="ItemImage is-image image-wrapper" style={getBackgroundStyle(item.rarity)}>
        <img className="image" src={src || getThumbnailURL(item)} alt={item.name} />
        {hasBadge ? <ItemBadge item={item} size={badgeSize}></ItemBadge> : null}
      </div>
    )
  }
}
