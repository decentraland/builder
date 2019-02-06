import * as React from 'react'
import { Header } from 'decentraland-ui'
import { Props } from './HorizontalCard.types'
import './HorizontalCard.css'

export default class HorizontalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset

    let classes = 'AssetCard horizontal'
    if (isDragging) {
      classes += ' is-dragging'
    }

    return (
      <div className={classes}>
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title">
          {name}
        </Header>
      </div>
    )
  }
}
