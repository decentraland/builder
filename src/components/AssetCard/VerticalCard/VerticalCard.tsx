import * as React from 'react'
import { Header } from 'decentraland-ui'
import { Props } from './VerticalCard.types'
import './VerticalCard.css'

export default class VerticalCard extends React.PureComponent<Props> {
  render() {
    const { thumbnail, name } = this.props.asset

    return (
      <div className="VerticalCard">
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title" title={name}>
          {name}
        </Header>
      </div>
    )
  }
}
