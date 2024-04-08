import * as React from 'react'
import classNames from 'classnames'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'

import { getBackgroundStyle, getThumbnailURL } from 'modules/item/utils'
import ItemBadge from 'components/ItemBadge'
import { Props } from './ItemImage.types'
import './ItemImage.css'

export default class ItemImage extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    hasBadge: false,
    hasRarityBackground: true
  }

  render() {
    const { className, item, src, badgeSize, hasBadge, hasRarityBadge, hasRarityBackground } = this.props

    return (
      <div
        className={classNames('ItemImage', 'is-image', 'image-wrapper', className)}
        style={hasRarityBackground ? getBackgroundStyle(item.rarity) : { backgroundColor: 'var(--dark-two)' }}
      >
        <img className="item-image" src={src || getThumbnailURL(item)} alt={item.name} />
        <div className="badges-container">
          {hasRarityBadge && item.rarity && item.data.category ? (
            <RarityBadge className="rarity-badge" rarity={item.rarity} size="medium" withTooltip />
          ) : null}
          {hasBadge ? <ItemBadge item={item} size={badgeSize} /> : null}
        </div>
      </div>
    )
  }
}
