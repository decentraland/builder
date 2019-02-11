import * as React from 'react'
import { Props } from './GroundCard.types'

import './GroundCard.css'

export default class GroundCard extends React.PureComponent<Props> {
  handleClick = () => {
    this.props.onClick(this.props.name)
  }

  render() {
    const { name, thumbnail, isActive } = this.props
    return (
      <div className={'GroundCard ' + (isActive ? 'active' : '')} onClick={this.handleClick}>
        <div className="overlay" />
        <img src={thumbnail} title={name} />
      </div>
    )
  }
}
