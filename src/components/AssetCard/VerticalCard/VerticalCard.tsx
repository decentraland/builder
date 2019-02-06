import * as React from 'react'
import { Props } from './VerticalCard.types'
import './VerticalCard.css'

export default class VerticalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset

    return (
      <div className="VerticalCard" style={{ opacity: isDragging ? 0.5 : 1 }}>
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
      </div>
    )
  }
}
