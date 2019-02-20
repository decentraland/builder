import * as React from 'react'
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

    return (
      <div className={classes} title={name}>
        <img className="thumbnail" src={thumbnail} alt="" />
      </div>
    )
  }
}
