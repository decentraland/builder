import * as React from 'react'

import { RARITY_COLOR, RARITY_COLOR_LIGHT } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import { Props } from './ItemImage.types'
import './ItemImage.css'
import { getContentStorageUrl } from 'lib/api/builder'

export default class ItemImage extends React.PureComponent<Props> {
  static defaultProps = {
    hasBadge: false
  }

  render() {
    const { item, hasBadge } = this.props

    const style = item.rarity
      ? { backgroundImage: `radial-gradient(${RARITY_COLOR_LIGHT[item.rarity]}, ${RARITY_COLOR[item.rarity]})` }
      : { backgroundColor: 'var(--secondary)' }

    return (
      <div className="ItemImage image-wrapper" style={style}>
        <img className="image" src={getContentStorageUrl(item.contents[item.thumbnail])} alt={item.name} />
        {hasBadge ? <ItemBadge item={item}></ItemBadge> : null}
      </div>
    )
  }
}
