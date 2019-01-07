import * as React from 'react'
import { Header } from 'decentraland-ui'
import { Props } from './HorizontalCard.types'
import './HorizontalCard.css'

export default class HorizontalCard extends React.PureComponent<Props> {
  render() {
    const { thumbnail, name } = this.props.asset

    return (
      <div className="HorizontalCard">
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title">
          {name}
        </Header>
      </div>
    )
  }
}
