import * as React from 'react'

import { GROUND_CATEGORY } from 'modules/asset/types'

import { Props } from './VerticalCard.types'
import './VerticalCard.css'

export default class VerticalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset

    let classes = 'AssetCard vertical'
    if (isDragging) {
      classes += ' is-dragging'
    }
    if (asset.category === GROUND_CATEGORY) {
      classes += ' ground'
    }

    return (
      <div className={classes} title={name}>
        <img className="thumbnail" src={thumbnail} alt="" />
      </div>
    )
  }
}
