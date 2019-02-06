import * as React from 'react'
import { Header } from 'decentraland-ui'
import { Props } from './HorizontalCard.types'
import './HorizontalCard.css'

export default class HorizontalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset

    return (
      <div className="HorizontalCard" style={{ opacity: isDragging ? 0.5 : 1 }}>
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title">
          {name}
        </Header>
      </div>
    )
  }
}
