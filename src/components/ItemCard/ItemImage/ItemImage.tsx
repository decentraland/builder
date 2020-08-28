import * as React from 'react'

import { RARITY_COLOR, RARITY_COLOR_LIGHT } from 'modules/item/types'
import { Props } from './ItemImage.types'

export default class ItemImage extends React.PureComponent<Props> {
  render() {
    const { item } = this.props

    const style = item.rarity
      ? { backgroundImage: `radial-gradient(${RARITY_COLOR_LIGHT[item.rarity]}, ${RARITY_COLOR[item.rarity]})` }
      : { backgroundColor: '#FFF' }

    return (
      <div className="ItemImage image-wrapper" style={style}>
        <img className="image" src={item.thumbnail} alt={item.name} />
      </div>
    )
  }
}
